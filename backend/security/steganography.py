import os
import numpy as np
from PIL import Image
from typing import Dict, Optional
from config.config import *

def analyze_image(image_path: str) -> Dict:
    results = {
        'is_suspicious': False,
        'overall_score': 0.0,
        'details': {}
    }
    
    try:
        pil_image = Image.open(image_path)
        
        if ENABLE_LSB_ANALYSIS:
            lsb_results = _analyze_lsb(np.array(pil_image))
            results['details']['lsb'] = lsb_results
            results['overall_score'] += lsb_results['score'] * 0.4
        
        if ENABLE_HISTOGRAM_ANALYSIS:
            hist_results = _analyze_histogram(pil_image)
            results['details']['histogram'] = hist_results
            results['overall_score'] += hist_results['score'] * 0.3
        
        if ENABLE_EOF_ANALYSIS:
            eof_results = _analyze_eof(image_path)
            results['details']['eof'] = eof_results
            results['overall_score'] += eof_results['score'] * 0.3
        
        results['is_suspicious'] = results['overall_score'] > STEGANOGRAPHY_THRESHOLD
        
    except Exception as e:
        results['error'] = str(e)
        results['is_suspicious'] = True
    
    return results

def _analyze_lsb(img: np.ndarray) -> Dict:
    lsb_planes = []
    for i in range(3):
        channel = img[:, :, i] if len(img.shape) == 3 else img
        lsb = channel & 1
        lsb_planes.append(lsb)
    
    entropy_values = []
    for plane in lsb_planes:
        _, counts = np.unique(plane, return_counts=True)
        probabilities = counts / len(plane.flatten())
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        entropy_values.append(entropy)
    
    avg_entropy = np.mean(entropy_values)
    expected_entropy = 1.0
    entropy_diff = abs(avg_entropy - expected_entropy)
    
    score = min(entropy_diff * 2, 1.0)
    
    return {
        'score': score,
        'entropy_values': entropy_values.tolist(),
        'average_entropy': float(avg_entropy),
        'entropy_difference': float(entropy_diff)
    }

def _analyze_histogram(pil_image: Image.Image) -> Dict:
    histograms = []
    for channel in range(3):
        hist = pil_image.histogram()[channel*256:(channel+1)*256]
        histograms.append(hist)
    
    smoothness_scores = []
    for hist in histograms:
        smoothness = 0
        for i in range(1, len(hist)):
            smoothness += abs(hist[i] - hist[i-1])
        smoothness_scores.append(smoothness)
    
    avg_smoothness = np.mean(smoothness_scores)
    max_expected_smoothness = 5000
    score = min(avg_smoothness / max_expected_smoothness, 1.0)
    
    return {
        'score': score,
        'smoothness_scores': smoothness_scores,
        'average_smoothness': float(avg_smoothness)
    }

def _analyze_eof(image_path: str) -> Dict:
    with open(image_path, 'rb') as f:
        content = f.read()
    
    detected_format = None
    end_marker = None
    
    if content.startswith(b'\xFF\xD8\xFF'):
        detected_format = 'JPEG'
        end_marker = b'\xFF\xD9'
    elif content.startswith(b'\x89PNG\r\n\x1a\n'):
        detected_format = 'PNG'
        end_marker = b'IEND\xaeB`\x82'
    
    if not end_marker:
        return {'score': 0.0, 'format': 'unknown'}
    
    if detected_format == 'JPEG':
        eoi_pos = content.rfind(end_marker)
        data_after_eoi = len(content) - (eoi_pos + 2)
        score = min(data_after_eoi / 1000, 1.0)
    else:
        end_pos = content.find(end_marker)
        data_after_end = len(content) - (end_pos + len(end_marker))
        score = min(data_after_end / 1000, 1.0)
    
    return {
        'score': score,
        'format': detected_format,
        'extra_bytes': int(data_after_eoi if detected_format == 'JPEG' else data_after_end)
    }
