import os
import numpy as np
from PIL import Image
from typing import Dict, Optional
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

        # LSB Analysis - 35% weight
        if ENABLE_LSB_ANALYSIS:
            lsb_results = _analyze_lsb(img_array)
            results['details']['lsb'] = lsb_results
            results['overall_score'] += lsb_results['score'] * 0.35

        # Histogram Analysis - 15% weight
        if ENABLE_HISTOGRAM_ANALYSIS:
            hist_results = _analyze_histogram(pil_image)
            results['details']['histogram'] = hist_results
            results['overall_score'] += hist_results['score'] * 0.15

        # EOF Analysis - 50% weight
        if ENABLE_EOF_ANALYSIS:
            eof_results = _analyze_eof(image_path)
            results['details']['eof'] = eof_results
            results['overall_score'] += eof_results['score'] * 0.5

        # Determine if suspicious
        any_high_score = False
        if results['details'].get('eof', {}).get('score', 0) > 0.6:
            any_high_score = True
        if results['details'].get('lsb', {}).get('score', 0) > 0.7:
            any_high_score = True

        results['is_suspicious'] = results['overall_score'] > 0.5 or any_high_score

    except Exception as e:
        results['error'] = str(e)
        results['is_suspicious'] = True

    return results


def _analyze_lsb(img: np.ndarray) -> Dict:
    """
    Analyze LSB plane for steganographic content.
    Key insight: In natural images, LSB correlates with MSB pattern.
    Steganography disrupts this correlation by replacing LSB with random data.
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

        # Extract LSB and MSBs (using uint8 operations)
        lsb = (flat_channel & 1).astype(np.float32)
        msbs = ((flat_channel >> 1) & 0x7F).astype(np.float32)  # Bits 1-7

        # Test 1: Correlation between MSB and LSB
        # In natural images, there's often correlation
        # In steganography, LSB is random and uncorrelated
        if len(msbs) > 1 and np.std(msbs) > 0 and np.std(lsb) > 0:
            try:
                correlation = np.abs(np.corrcoef(msbs, lsb)[0, 1])
                corr_score = max(0, 1.0 - correlation)
            except:
                corr_score = 0.5
        else:
            corr_score = 0.5

        # Test 2: Statistical test - LSB should show bias in natural images
        # Count transitions in LSB plane
        lsb_plane = (channel & 1)
        transitions = 0
        total_pairs = 0

        # Count horizontal transitions
        transitions += np.sum(np.diff(lsb_plane, axis=1) != 0)
        # Count vertical transitions
        transitions += np.sum(np.diff(lsb_plane, axis=0) != 0)
        total_pairs = (lsb_plane.shape[0] * (lsb_plane.shape[1] - 1) +
                       (lsb_plane.shape[0] - 1) * lsb_plane.shape[1])

        transition_ratio = transitions / (total_pairs + 1e-10)
        # Random LSB: ~50% transitions, Natural: much lower
        # High ratio = suspicious
        transition_score = abs(transition_ratio - 0.5) / 0.5
        transition_score = min(transition_score, 1.0)

        # Test 3: Entropy-based randomness test
        _, counts = np.unique(lsb, return_counts=True)
        probabilities = counts / len(lsb)
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        # Random LSB has entropy close to 1.0
        entropy_score = abs(entropy - 1.0) / 0.3
        entropy_score = min(entropy_score, 1.0)

        # Combine: if multiple tests indicate steganography, flag it
        channel_score = max(
            corr_score * 0.5, transition_score * 0.3, entropy_score * 0.2)
        lsb_scores.append(channel_score)

    avg_lsb_score = np.mean(lsb_scores) if lsb_scores else 0.0

    return {
        'score': avg_lsb_score,
        'channel_scores': [float(s) for s in lsb_scores],
        'average_score': float(avg_lsb_score)
    }


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
        # Normalized flatness (high if very flat)
        flatness = 1.0 - min(hist_std / (hist_mean + 1e-10), 1.0)
        flatness_scores.append(flatness)

    avg_flatness = np.mean(flatness_scores)

    # Check for suspicious patterns (too many zeros or too uniform)
    zero_bins = sum(1 for h in histograms for v in h if v == 0)
    total_bins = len(histograms) * 256
    zero_ratio = zero_bins / total_bins

    # If too many empty bins, could indicate steganography
    zero_score = min(zero_ratio * 2, 1.0)

    score = max(avg_flatness * 0.6 + zero_score * 0.4, 0.0)

    return {
        'score': score,
        'flatness_scores': [float(f) for f in flatness_scores],
        'average_flatness': float(avg_flatness),
        'zero_bins': int(zero_bins),
        'zero_ratio': float(zero_ratio)
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
