import os
import numpy as np
from PIL import Image
from typing import Dict, Optional
from scipy import stats
from scipy.fft import dctn, idctn
from config.config import ENABLE_EOF_ANALYSIS, ENABLE_HISTOGRAM_ANALYSIS, ENABLE_LSB_ANALYSIS, STEGANOGRAPHY_THRESHOLD


def analyze_image(image_path: str) -> Dict:
    results = {
        'is_suspicious': False,
        'overall_score': 0.0,
        'details': {}
    }

    try:
        pil_image = Image.open(image_path)

        # Ensure RGB mode
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')

        img_array = np.array(pil_image, dtype=np.uint8)

        # LSB Analysis - 25% weight
        if ENABLE_LSB_ANALYSIS:
            lsb_results = _analyze_lsb(img_array)
            results['details']['lsb'] = lsb_results
            results['overall_score'] += lsb_results['score'] * 0.25

        # Histogram Analysis - 20% weight
        if ENABLE_HISTOGRAM_ANALYSIS:
            hist_results = _analyze_histogram(pil_image)
            results['details']['histogram'] = hist_results
            results['overall_score'] += hist_results['score'] * 0.20

        # EOF Analysis - 15% weight
        if ENABLE_EOF_ANALYSIS:
            eof_results = _analyze_eof(image_path)
            results['details']['eof'] = eof_results
            results['overall_score'] += eof_results['score'] * 0.15

        # Frequency Domain Analysis - 40% weight
        freq_results = _analyze_frequency_domain(img_array)
        results['details']['frequency'] = freq_results
        results['overall_score'] += freq_results['score'] * 0.40

        # Determine if suspicious - optimized for real data
        any_high_score = False
        if results['details'].get('eof', {}).get('score', 0) > 0.3:
            any_high_score = True
        if results['details'].get('lsb', {}).get('score', 0) > 0.25:  # Lower LSB threshold
            any_high_score = True
        if results['details'].get('frequency', {}).get('score', 0) > 0.4:
            any_high_score = True
        if results['details'].get('histogram', {}).get('score', 0) > 0.35:  # Lower histogram threshold
            any_high_score = True

        # More balanced decision logic
        overall_threshold = 0.3  # Lower overall threshold
        if any_high_score:
            overall_threshold = 0.15  # Even lower threshold for strong indicators
        
        results['is_suspicious'] = results['overall_score'] > overall_threshold

    except Exception as e:
        results['error'] = str(e)
        results['is_suspicious'] = True

    return results


def _analyze_lsb(img: np.ndarray) -> Dict:
    """
    Enhanced LSB analysis for steganography detection.
    Multiple advanced techniques to detect various LSB steganography methods.
    """
    # Ensure we have 3 channels and uint8
    if len(img.shape) == 2:
        img = np.stack([img] * 3, axis=-1)
    elif img.shape[2] == 4:  # RGBA
        img = img[:, :, :3]

    img = img.astype(np.uint8)
    lsb_scores = []

    for channel_idx in range(min(3, img.shape[2])):
        channel = img[:, :, channel_idx]
        flat_channel = channel.flatten()

        # Extract LSB and MSBs
        lsb = (flat_channel & 1).astype(np.float32)
        msbs = ((flat_channel >> 1) & 0x7F).astype(np.float32)

        # Test 1: Enhanced correlation analysis - much more specific
        if len(msbs) > 1 and np.std(msbs) > 0 and np.std(lsb) > 0:
            try:
                correlation = np.abs(np.corrcoef(msbs, lsb)[0, 1])
                # Natural images typically have correlation > 0.02
                # Only flag if correlation is extremely low (indicative of random LSB)
                corr_score = max(0, (0.02 - correlation) / 0.02) if correlation < 0.02 else 0
                corr_score = min(corr_score, 1.0)
            except:
                corr_score = 0.0  # Don't penalize for errors
        else:
            corr_score = 0.0

        # Test 2: Chi-square test on LSB distribution - much more specific
        # Natural images have non-uniform LSB distribution
        unique, counts = np.unique(lsb, return_counts=True)
        expected_uniform = len(lsb) / 2.0
        
        if len(counts) == 2:
            chi2_stat = ((counts[0] - expected_uniform)**2 + (counts[1] - expected_uniform)**2) / expected_uniform
            # Much higher threshold - only flag if extremely uniform (near 50/50)
            # Perfect uniform distribution would have chi2 = 0
            # Natural images typically have chi2 > 10
            chi2_score = max(0, (10.0 - chi2_stat) / 10.0) if chi2_stat < 10.0 else 0
            chi2_score = min(chi2_score, 1.0)
        else:
            chi2_score = 0.0

        # Test 3: Adjacent pixel LSB correlation - much more specific
        # In natural images, adjacent pixels often have similar LSB
        lsb_2d = (channel & 1).astype(np.float32)
        
        # Horizontal correlation
        h_diff = np.mean(np.abs(np.diff(lsb_2d, axis=1)))
        # Vertical correlation  
        v_diff = np.mean(np.abs(np.diff(lsb_2d, axis=0)))
        
        # Only flag if differences are extremely high (near 0.5 = random)
        avg_diff = (h_diff + v_diff) / 2.0
        # Natural images typically have avg_diff < 0.3
        # Only suspicious if avg_diff > 0.45 (very close to random)
        adj_score = max(0, (avg_diff - 0.45) / 0.05) if avg_diff > 0.45 else 0
        adj_score = min(adj_score, 1.0)

        # Test 4: Block-based LSB analysis - much more specific
        # Divide image into blocks and analyze LSB patterns within blocks
        h, w = channel.shape
        block_size = 8
        block_scores = []
        
        for i in range(0, h - block_size + 1, block_size):
            for j in range(0, w - block_size + 1, block_size):
                block = channel[i:i+block_size, j:j+block_size]
                block_lsb = (block & 1).flatten()
                
                # Check LSB uniformity within block
                if len(block_lsb) > 0:
                    block_ones = np.sum(block_lsb)
                    block_ratio = block_ones / len(block_lsb)
                    # Only flag if block is extremely close to 50% (within 2%)
                    deviation = abs(block_ratio - 0.5)
                    if deviation < 0.02:  # Within 2% of perfect 50/50
                        block_score = (0.02 - deviation) / 0.02  # Higher score = closer to 50%
                        block_scores.append(block_score)
        
        # Only consider it suspicious if many blocks are extremely uniform
        if len(block_scores) > 0:
            block_uniformity = np.mean(block_scores)
            # Require at least 30% of blocks to be extremely uniform
            uniform_block_ratio = len(block_scores) / ((h // block_size) * (w // block_size))
            block_uniformity = block_uniformity if uniform_block_ratio > 0.3 else 0.0
        else:
            block_uniformity = 0.0

        # Test 5: Enhanced RS Analysis
        rs_score = _enhanced_rs_analysis(channel)

        # Test 6: Frequency domain LSB detection
        freq_score = _frequency_lsb_analysis(channel)

        # Combine scores with increased sensitivity for extreme cases
        # Use sum instead of max for better detection
        channel_score = min(
            corr_score * 0.20 +
            chi2_score * 0.25 +
            adj_score * 0.15 +
            block_uniformity * 0.20 +
            rs_score * 0.10 +
            freq_score * 0.10,
            1.0
        )
        
        lsb_scores.append(channel_score)

    avg_lsb_score = np.mean(lsb_scores) if lsb_scores else 0.0

    return {
        'score': avg_lsb_score,
        'channel_scores': [float(s) for s in lsb_scores],
        'average_score': float(avg_lsb_score)
    }


def _enhanced_rs_analysis(channel: np.ndarray) -> float:
    """
    Enhanced Regular-Singular analysis for LSB steganography detection.
    More sensitive than basic RS analysis.
    """
    def _group_type(x, y, z):
        """Determine if a group is regular, singular, or unusable"""
        def flip_lsb(val):
            return val ^ 1
        
        # Calculate differences with proper type casting
        f_xy = abs(int(x) - int(y))
        f_yz = abs(int(y) - int(z))
        f_xyz = abs(int(flip_lsb(x)) - int(flip_lsb(y)))
        f_yzx = abs(int(flip_lsb(y)) - int(flip_lsb(z)))
        
        if f_xy > f_yz and f_xyz > f_yzx:
            return 'regular'
        elif f_xy < f_yz and f_xyz < f_yzx:
            return 'singular'
        else:
            return 'unusable'
    
    flat = channel.flatten()
    if len(flat) < 3:
        return 0.0
    
    regular_count = 0
    singular_count = 0
    total_groups = 0
    
    # Analyze overlapping groups for better sensitivity
    for i in range(len(flat) - 2):
        x, y, z = flat[i], flat[i+1], flat[i+2]
        gtype = _group_type(x, y, z)
        
        if gtype == 'regular':
            regular_count += 1
            total_groups += 1
        elif gtype == 'singular':
            singular_count += 1
            total_groups += 1
    
    if total_groups == 0:
        return 0.0
    
    # Enhanced RS statistic
    rs_stat = abs(regular_count - singular_count) / total_groups
    
    # Lower threshold for detection
    return min(rs_stat * 3.0, 1.0)


def _frequency_lsb_analysis(channel: np.ndarray) -> float:
    """
    Frequency domain analysis specifically for LSB steganography.
    Detects patterns in the frequency domain that indicate LSB manipulation.
    """
    try:
        # Apply DCT to detect frequency domain anomalies
        channel_float = channel.astype(np.float32)
        dct_coeffs = dctn(channel_float, type=2, norm='ortho')
        
        # Focus on high-frequency coefficients where LSB steganography has more impact
        h, w = dct_coeffs.shape
        high_freq_region = dct_coeffs[h//2:, w//2:]
        
        # Calculate statistical properties
        if high_freq_region.size > 0:
            # LSB steganography often increases high-frequency energy
            high_freq_energy = np.mean(np.abs(high_freq_region))
            total_energy = np.mean(np.abs(dct_coeffs))
            energy_ratio = high_freq_energy / (total_energy + 1e-10)
            
            # High ratio indicates potential steganography
            freq_score = min(energy_ratio * 5.0, 1.0)
        else:
            freq_score = 0.0
            
        return freq_score
        
    except:
        return 0.0


def _rs_analysis(channel: np.ndarray) -> float:
    """
    Regular-Singular analysis for LSB steganography detection.
    This is a more sophisticated method that analyzes pixel groups.
    """
    def _group_type(x, y, z):
        """Determine if a group is regular, singular, or unusable"""
        # LSB flipping function
        def flip_lsb(val):
            return val ^ 1
        
        # Calculate differences with proper type casting to avoid overflow
        f_xy = abs(int(x) - int(y))
        f_yz = abs(int(y) - int(z))
        f_xyz = abs(int(flip_lsb(x)) - int(flip_lsb(y)))
        f_yzx = abs(int(flip_lsb(y)) - int(flip_lsb(z)))
        
        # Regular group
        if f_xy > f_yz and f_xyz > f_yzx:
            return 'regular'
        # Singular group  
        elif f_xy < f_yz and f_xyz < f_yzx:
            return 'singular'
        else:
            return 'unusable'
    
    # Flatten channel for easier processing
    flat = channel.flatten()
    if len(flat) < 3:
        return 0.0
    
    # Count group types
    regular_count = 0
    singular_count = 0
    total_groups = 0
    
    # Analyze groups of 3 consecutive pixels
    for i in range(len(flat) - 2):
        x, y, z = flat[i], flat[i+1], flat[i+2]
        gtype = _group_type(x, y, z)
        
        if gtype == 'regular':
            regular_count += 1
            total_groups += 1
        elif gtype == 'singular':
            singular_count += 1
            total_groups += 1
    
    if total_groups == 0:
        return 0.0
    
    # RS statistic
    rs_stat = abs(regular_count - singular_count) / total_groups
    
    # Higher RS statistic indicates more likely steganography
    return min(rs_stat * 2, 1.0)


def _sample_pair_analysis(channel: np.ndarray) -> float:
    """
    Sample Pair Analysis for LSB steganography detection.
    Analyzes the relationship between adjacent pixel pairs.
    """
    flat = channel.flatten()
    if len(flat) < 2:
        return 0.0
    
    # Count different types of pixel pairs
    x_pairs = 0  # (2k, 2k) or (2k+1, 2k+1)
    y_pairs = 0  # (2k, 2k+1) or (2k+1, 2k)
    z_pairs = 0  # (2k+1, 2k) or (2k, 2k+1)
    w_pairs = 0  # (2k+1, 2k+1) or (2k, 2k)
    
    total_pairs = 0
    
    for i in range(len(flat) - 1):
        p1, p2 = flat[i], flat[i+1]
        
        # Extract LSB values
        lsb1 = p1 & 1
        lsb2 = p2 & 1
        
        # Extract higher bits
        high1 = p1 >> 1
        high2 = p2 >> 1
        
        if high1 == high2:
            if lsb1 == lsb2:
                x_pairs += 1
            else:
                y_pairs += 1
        elif abs(high1 - high2) == 1:
            if lsb1 == lsb2:
                w_pairs += 1
            else:
                z_pairs += 1
        
        total_pairs += 1
    
    if total_pairs == 0:
        return 0.0
    
    # Calculate steganography estimate
    # Based on the relationship between different pair types
    if y_pairs + z_pairs > 0:
        stego_estimate = (2 * z_pairs) / (y_pairs + z_pairs)
        # Normalize to [0, 1] range
        score = min(abs(stego_estimate - 1.0), 1.0)
    else:
        score = 0.0
    
    return score


def _analyze_histogram(pil_image: Image.Image) -> Dict:
    # Convert to RGB if needed
    if pil_image.mode != 'RGB':
        pil_image = pil_image.convert('RGB')

    histograms = []
    for channel in range(3):
        hist = pil_image.histogram()[channel*256:(channel+1)*256]
        histograms.append(hist)

    # Check for flatness (LSB steganography flattens histograms)
    flatness_scores = []
    for hist in histograms:
        # Calculate standard deviation of histogram
        hist_mean = np.mean(hist)
        hist_std = np.std(hist)
        
        # Only consider flatness if histogram has sufficient data
        if hist_mean > 10:  # Avoid false positives on very dark/simple images
            # Normalized flatness (high if very flat)
            flatness = 1.0 - min(hist_std / (hist_mean + 1e-10), 1.0)
            flatness_scores.append(flatness)
        else:
            flatness_scores.append(0.0)  # Simple images shouldn't trigger flatness detection

    avg_flatness = np.mean(flatness_scores)

    # Check for suspicious patterns (too many zeros or too uniform)
    zero_bins = sum(1 for h in histograms for v in h if v == 0)
    total_bins = len(histograms) * 256
    zero_ratio = zero_bins / total_bins

    # Only consider zero bins suspicious if ratio is very high
    zero_score = min(zero_ratio * 5, 1.0) if zero_ratio > 0.1 else 0.0

    # Additional check: histogram smoothness
    smoothness_scores = []
    for hist in histograms:
        # Calculate second derivative to detect artificial smoothness
        if len(hist) > 2:
            smoothness = np.std(np.diff(hist, 2))
            # Very low smoothness can indicate steganographic manipulation
            smoothness_score = max(0, 1.0 - smoothness / (np.mean(hist) + 1e-10))
            smoothness_scores.append(smoothness_score)
        else:
            smoothness_scores.append(0.0)

    avg_smoothness = np.mean(smoothness_scores)

    score = max(avg_flatness * 0.4 + zero_score * 0.3 + avg_smoothness * 0.3, 0.0)

    return {
        'score': score,
        'flatness_scores': [float(f) for f in flatness_scores],
        'average_flatness': float(avg_flatness),
        'zero_bins': int(zero_bins),
        'zero_ratio': float(zero_ratio)
    }


def _analyze_frequency_domain(img: np.ndarray) -> Dict:
    """
    Enhanced frequency domain analysis with better specificity.
    Focuses on patterns that are truly indicative of steganography.
    """
    # Ensure we have 3 channels and uint8
    if len(img.shape) == 2:
        img = np.stack([img] * 3, axis=-1)
    elif img.shape[2] == 4:  # RGBA
        img = img[:, :, :3]

    img = img.astype(np.float32)
    freq_scores = []

    for channel_idx in range(min(3, img.shape[2])):
        channel = img[:, :, channel_idx]
        
        # Skip analysis for very uniform channels (avoid false positives)
        if np.std(channel) < 5:
            freq_scores.append(0.0)
            continue
        
        # Test 1: Enhanced DCT coefficient analysis
        h, w = channel.shape
        dct_anomalies = []
        
        # Sample blocks to avoid over-processing
        block_step = max(8, min(h, w) // 32)
        
        for i in range(0, h - 7, block_step):
            for j in range(0, w - 7, block_step):
                block = channel[i:i+8, j:j+8]
                
                # Skip very uniform blocks
                if np.std(block) < 2:
                    continue
                
                dct_block = dctn(block, type=2, norm='ortho')
                
                # Focus on specific mid-frequency coefficients
                # These are most commonly manipulated in steganography
                mid_freq = dct_block[2:5, 2:5].flatten()  # Smaller, more specific region
                
                if len(mid_freq) > 0:
                    # More sophisticated anomaly detection
                    coeff_std = np.std(mid_freq)
                    coeff_mean = np.mean(np.abs(mid_freq))
                    
                    # Only consider it anomalous if there's significant energy
                    if coeff_mean > 1.0:
                        # Higher threshold for anomaly detection
                        anomaly_score = min(coeff_std / (coeff_mean + 1e-10) / 3.0, 1.0)
                        dct_anomalies.append(anomaly_score)
        
        # Test 2: Statistical distribution analysis
        if len(dct_anomalies) > 5:  # Only if we have enough samples
            # Check if anomalies are clustered (indicative of steganography)
            anomaly_mean = np.mean(dct_anomalies)
            anomaly_std = np.std(dct_anomalies)
            
            # High clustering of anomalies is more suspicious
            clustering_score = min(anomaly_mean * 2.0, 1.0) if anomaly_std < 0.3 else 0.0
        else:
            clustering_score = 0.0
        
        # Test 3: Block boundary analysis (specific to JPEG steganography)
        boundary_anomalies = []
        
        for i in range(0, h - 8, block_step):
            for j in range(0, w - 8, block_step):
                block = channel[i:i+8, j:j+8]
                
                # Check for discontinuities at block boundaries
                if j + 8 < w:
                    right_boundary = np.mean(np.abs(block[:, -1] - channel[i:i+8, j+8]))
                    if right_boundary > np.std(block) * 2:
                        boundary_anomalies.append(right_boundary)
                
                if i + 8 < h:
                    bottom_boundary = np.mean(np.abs(block[-1, :] - channel[i+8, j:j+8]))
                    if bottom_boundary > np.std(block) * 2:
                        boundary_anomalies.append(bottom_boundary)
        
        # Calculate boundary anomaly score
        if boundary_anomalies:
            boundary_score = min(np.mean(boundary_anomalies) / 10.0, 1.0)
        else:
            boundary_score = 0.0
        
        # Combine scores with much higher specificity
        # Require multiple strong indicators to flag as suspicious
        anomaly_mean = np.mean(dct_anomalies) if dct_anomalies else 0.0
        
        # Much stricter requirements - need extremely strong evidence
        if clustering_score > 0.7 and boundary_score > 0.5 and anomaly_mean > 0.6:
            channel_score = (clustering_score * 0.4 + boundary_score * 0.4 + anomaly_mean * 0.2)
        else:
            channel_score = 0.0  # No score unless extremely strong evidence
        
        freq_scores.append(channel_score)
    
    avg_freq_score = np.mean(freq_scores) if freq_scores else 0.0
    
    return {
        'score': avg_freq_score,
        'channel_scores': [float(s) for s in freq_scores],
        'average_score': float(avg_freq_score)
    }


def _analyze_eof(image_path: str) -> Dict:
    with open(image_path, 'rb') as f:
        content = f.read()

    detected_format = None
    end_marker = None
    data_after_marker = 0

    if content.startswith(b'\xFF\xD8\xFF'):
        detected_format = 'JPEG'
        end_marker = b'\xFF\xD9'
        eoi_pos = content.rfind(end_marker)
        if eoi_pos != -1:
            data_after_marker = len(content) - (eoi_pos + len(end_marker))
    elif content.startswith(b'\x89PNG\r\n\x1a\n'):
        detected_format = 'PNG'
        end_marker = b'IEND\xaeB`\x82'
        end_pos = content.find(end_marker)
        if end_pos != -1:
            data_after_marker = len(content) - (end_pos + len(end_marker))
    else:
        return {'score': 0.0, 'format': 'unknown', 'extra_bytes': 0}

    # Even small amounts of data after marker are suspicious
    # 1 byte = 0.1, 100 bytes = 1.0 (very suspicious)
    score = min(data_after_marker / 100, 1.0)

    return {
        'score': score,
        'format': detected_format,
        'extra_bytes': int(data_after_marker)
    }
