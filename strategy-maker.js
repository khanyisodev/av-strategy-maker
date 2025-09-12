function init() {
  const siteBody = document.getElementById('lqd-site-content') || document.body;
  siteBody.classList.add('min-h-screen', 'bg-slate-950', 'text-slate-100', 'antialiased');

    // -----------------------------
    // Preloaded multipliers (looping)
    // -----------------------------
    const PRELOADED = [
      "3.34x", "2.71x", "45.6x", "2.03x", "4.92x", "2.35x", "97.3x", "31.4x", "5.01x", "1.07x",
      "1.78x", "1.45x", "2.45x", "5.49x", "1.37x", "2.45x", "3x", "2.49x", "4.1x", "2.46x",
      "1.49x", "5.11x", "3.43x", "1.26x", "2.55x", "1.72x", "1.27x", "1.73x", "1.05x", "1.26x",
      "3.36x", "1.17x", "1.45x", "3.69x", "1.52x", "1.93x", "1.1x", "1.22x", "8.98x", "10.34x",
      "1.45x", "1.18x", "1.63x", "1.46x", "1.18x", "1.65x", "1.62x", "1.69x", "1.75x", "1x",
      "1.69x", "112.1x", "1.01x", "3.24x",
      "1.07x", "1.53x", "1.3x", "1.52x", "17.76x", "1.54x", "1.09x", "1.65x", "228.91x", "1.46x",
      "2.24x", "3.35x", "3.15x", "1.06x", "1.48x", "1.46x", "3.77x", "9.08x", "1.11x", "3.46x",
      "1.21x", "1.14x", "3.08x", "1.02x", "12.38x", "1.24x", "1.08x", "1.47x", "3.66x", "74.03x",
      "14.27x", "3.58x", "4.96x", "1.14x", "3.53x", "40.17x", "2.87x", "7.94x", "1.64x", "10.33x",
      "17.4x", "9.28x", "19.18x", "4.06x", "1.32x", "1.05x", "8.3x", "2.24x", "1.04x", "3.04x",
      "30.69x", "1.37x", "1.31x", "1x", "2.18x", "1.8x", "1.68x", "3.42x", "4.28x", "5.99x",
      "2x", "2.01x", "3.93x", "92.84x", "1.39x", "1.5x", "1x", "9.97x", "1.04x", "11x",
      "3.52x", "1.06x", "2.25x", "1.38x", "1.97x", "1.04x", "1.08x", "1.33x", "1.55x", "1.13x",
      "1.18x", "389.93x", "1.26x", "1.51x", "2.25x", "8.01x", "1.14x", "3.6x", "15.22x", "3.3x",
      "1.27x", "23.28x", "14.95x", "1.43x", "1.01x", "1x", "2.73x", "5.92x", "2.75x", "1.01x",
      "2.53x", "4.12x", "1.74x", "2.1x", "1.76x", "1.05x", "13.08x", "1.36x", "2.01x", "1.24x",
      "7.88x", "5.87x", "2.29x", "1x", "1.22x", "1.61x", "1.51x", "1.29x", "1.55x", "1.12x",
      "1.36x", "2.28x", "11.39x",
      "3.59x", "3.36x", "1.82x", "1.15x", "23.5x", "1.2x", "4.38x", "1.78x", "19.8x", "331.25x",
      "3.61x", "1.39x", "1x", "1.08x", "2.18x", "1.39x", "1.53x", "1.41x", "18.55x", "29.35x",
      "1.47x", "3.18x", "1.05x", "2.57x", "3.52x", "112.36x", "1.01x", "7.57x", "1.26x", "17.05x",
      "1x", "1.31x", "3.27x", "1.93x", "2.89x", "1.29x", "1.26x", "2.13x", "7.46x", "1.92x",
      "3.17x", "1.24x", "1.25x", "1.47x", "1.51x", "1.9x", "1.87x", "1.49x", "6.67x", "2.35x",
      "9.45x", "1.02x", "5.84x", "306.37x", "1.52x", "2.2x", "1x", "3.34x", "1.06x", "1.75x",
      "1.44x", "1.97x", "6.72x", "1.17x", "1.78x", "1.18x", "1.34x", "1.08x", "2.25x", "1.36x",
      "3.1x", "1.35x", "1.33x", "1.25x", "1.33x", "1.31x", "98.8x", "1.76x", "47.6x", "2.83x",
      "1.92x", "2.13x", "51.7x", "2x", "1.21x", "11.59x", "1.69x", "14.79x", "1.05x", "2.87x",
      "1.83x", "8.08x", "3.07x", "1.92x", "1.19x", "6.38x", "1.12x", "1.36x", "1.08x", "1.49x",
      "3.78x", "2.37x", "12.88x", "1.65x", "1.25x", "2.15x", "2.11x", "1.27x", "24.93x", "2.17x",
      "4.72x", "1.33x", "1.07x", "2.29x", "19.78x", "2.24x", "1.99x", "1x", "1.43x", "2.58x",
      "1x", "1.7x", "1.33x", "1.59x", "1.35x", "2.32x", "1.85x", "1.23x", "1.18x", "2.09x",
      "3.76x", "1.19x", "1.84x", "1.16x", "6.15x", "1.31x", "1.25x", "1.74x", "1.41x", "2.11x",
      "6.88x", "5.65x", "151.25x", "1.3x", "12.84x", "2.18x", "14.38x", "1.33x", "3.4x", "1.42x",
      "3.99x", "1.94x", "1.06x", "1.89x", "5.9x", "1.56x", "23.56x", "2.45x", "9.83x", "1.75x",
      "1.2x", "1.66x", "1x", "4.78x", "3.79x", "1.24x", "4.01x",
      "3.59x", "3.36x", "1.82x", "1.15x", "23.5x", "1.2x", "4.38x", "1.78x", "19.8x", "331.25x",
      "3.61x", "1.39x", "1x", "1.08x", "2.18x", "1.39x", "1.53x", "1.41x", "18.55x", "29.35x",
      "1.47x", "3.18x", "1.05x", "2.57x", "3.52x", "112.36x", "1.01x", "7.57x", "1.26x", "17.05x",
      "1x", "1.31x", "3.27x", "1.93x", "2.89x", "1.29x", "1.26x", "2.13x", "7.46x", "1.92x",
      "3.17x", "1.24x", "1.25x", "1.47x", "1.51x", "1.9x", "1.87x", "1.49x", "6.67x", "2.35x",
      "9.45x", "1.02x", "5.84x", "306.37x", "1.52x", "2.2x", "1x", "3.34x", "1.06x", "1.75x",
      "1.44x", "1.97x", "6.72x", "1.17x", "1.78x", "1.18x", "1.34x", "1.08x", "2.25x", "1.36x",
      "3.1x", "1.35x", "1.33x", "1.25x", "1.33x", "1.31x", "98.8x", "1.76x", "47.6x", "2.83x",
      "1.92x", "2.13x", "51.7x", "2x", "1.21x", "11.59x", "1.69x", "14.79x", "1.05x", "2.87x",
      "1.83x", "8.08x", "3.07x", "1.92x", "1.19x", "6.38x", "1.12x", "1.36x", "1.08x", "1.49x",
      "3.78x", "2.37x", "12.88x", "1.65x", "1.25x", "2.15x", "2.11x", "1.27x", "24.93x", "2.17x",
      "4.72x", "1.33x", "1.07x", "2.29x", "19.78x", "2.24x", "1.99x", "1x", "1.43x", "2.58x",
      "1x", "1.7x", "1.33x", "1.59x", "1.35x", "2.32x", "1.85x", "1.23x", "1.18x", "2.09x",
      "3.76x", "1.19x", "1.84x", "1.16x", "6.15x", "1.31x", "1.25x", "1.74x", "1.41x", "2.11x",
      "6.88x", "5.65x", "151.25x", "1.3x", "12.84x", "2.18x", "14.38x", "1.33x", "3.4x", "1.42x",
      "3.99x", "1.94x", "1.06x", "1.89x", "5.9x", "1.56x", "23.56x", "2.45x", "9.83x", "1.75x",
      "1.2x", "1.66x", "1x", "4.78x", "3.79x", "1.24x", "4.01x",
      "6.8x", "2.81x", "1.46x", "10.21x", "1.72x", "1.51x", "1.12x", "4.44x", "15.72x", "2.31x",
      "2.16x", "1.46x", "3.86x", "1.43x", "1.17x", "1.15x", "9.81x", "1.04x", "1.52x", "1.89x",
      "1.04x", "1.25x", "1x", "1.23x", "1.37x", "4.74x", "5.36x", "44.34x", "2.16x", "1.86x",
      "1x", "1.74x", "5.84x", "936.65x", "1.61x", "2x", "3.66x", "5.23x", "1.31x", "2.34x",
      "1.52x", "3.81x", "1.69x", "1.4x", "1.14x", "2.08x", "1.23x", "71.84x", "1.2x", "13.55x",
      "1.32x", "3.71x", "1.4x", "5.26x", "1.42x", "2.35x", "1.14x", "1.42x", "1.94x", "1x",
      "1.45x", "8.21x", "2.18x", "1.1x", "1.52x", "1.61x", "2.19x", "2.52x", "6.46x", "4.71x",
      "1.66x", "5.26x", "1.25x", "3.31x", "3.89x", "1.31x", "80.44x", "1.3x", "1.56x", "2.8x",
      "1.02x", "1.14x", "1.31x", "2.84x", "6.42x", "1.39x", "9.45x", "52.64x", "2.02x", "2.15x",
      "3.66x", "1.48x", "1.24x", "21.73x", "3.07x", "12.75x", "1.66x", "3.53x", "9.75x", "2.26x",
      "1.6x", "29.88x", "1.27x", "2.62x", "1x", "1.18x", "1.16x", "1x", "2.3x", "1.12x",
      "1.89x", "19.42x",
      "1x", "1.4x", "1.41x", "2.58x", "1.05x", "17.22x", "8.63x", "1.46x", "1.44x", "1.01x",
      "3.34x", "3.95x", "1.07x", "1.05x", "1.07x", "1.93x", "1.1x", "2.15x", "1.21x", "297.61x",
      "4.98x", "1.48x", "3.26x", "2.95x", "2.69x", "1.22x", "1.32x", "2.32x", "1.15x", "1.3x",
      "4.07x", "4.23x", "1.05x", "1x", "1.78x", "3.07x", "6.35x", "1.31x", "1.35x", "18.58x",
      "1.92x", "1.94x", "1.2x", "1.91x", "1.03x", "3.28x", "5.39x", "2.45x", "1x", "1.29x",
      "8.55x", "1x", "1.32x", "1.09x", "1.46x", "29.65x", "1.2x", "2.2x", "4.94x", "35.26x",
      "1.97x", "2.24x", "1.34x", "1.04x", "3.7x", "20.29x", "1.23x", "1.11x", "1.12x", "22.81x",
      "1.74x", "5.12x", "1.37x", "1.07x", "1.39x", "1.77x", "1.27x", "1.75x", "1.69x", "1.86x",
      "1.37x", "9.23x", "10.05x", "1.24x", "2x", "1x", "3.45x", "1.72x", "1.44x", "1.01x",
      "1.8x", "3.86x", "7.74x", "1.09x", "2.52x", "1x", "1.14x", "58.86x", "1.71x", "1.12x",
      "3.85x", "1.78x", "1.09x", "1.87x", "1x", "17.3x", "1.8x", "29.44x", "1.44x", "3.43x",
      "1.88x", "2.92x", "2.12x", "5.53x", "2.37x", "1.18x", "1.3x", "2.27x", "1.07x", "1.82x",
      "3.75x", "1.17x", "7.06x", "1.1x", "1.26x", "2.38x", "1.03x", "1.23x", "8.06x", "2.1x",
      "7.98x", "1.2x", "1.11x", "11.96x", "3.76x", "2.68x", "1.56x", "2.31x", "1.39x", "4.88x",
      "1.12x", "2.47x", "2x", "2.73x", "2.55x", "1.03x", "5.98x", "3.19x", "1.28x", "1.01x",
      "1.56x", "2.38x", "1.1x", "1.62x", "1.42x", "1.87x", "1.51x", "1.19x", "1.27x", "3.92x",
      "2.09x", "1.03x", "1.08x", "1.68x", "3.08x", "2.08x", "1.03x", "1.32x", "2.69x", "1.44x",
      "7.84x", "2.67x", "1.55x", "1x", "2.04x", "1.25x", "2.81x", "1.72x", "4.97x", "1.26x",
      "2.69x", "1.58x", "2.57x", "2.52x", "8.58x", "1.04x", "1.33x", "1.32x", "21.19x", "1.89x",
      "1.31x", "1x", "3.13x", "67.09x", "3x", "1.39x", "3.59x", "5.71x", "5.08x", "1.35x",
      "2.34x", "13.42x", "1.7x", "3.09x", "1.25x", "1.09x", "11.67x", "8.25x", "1.35x", "1.32x",
      "1.25x", "1.17x", "1x", "2.51x", "1.17x", "1.12x", "4.78x", "1.39x", "2.17x", "83.3x",
      "3.15x", "145.67x", "2.33x", "1.73x", "1x", "1.41x", "2.05x", "1.32x", "17.67x", "1.38x",
      "11.52x", "2.59x", "10.15x", "1.17x", "1.96x", "1.53x", "2.29x", "1.2x", "1.62x", "3.86x",
      "48.22x", "2.19x", "1.63x", "1.12x", "1.01x", "12.5x", "116.72x", "1.51x", "1.75x", "12.81x",
      "2.38x", "1.2x", "16.59x", "1.7x", "2.42x", "1.33x", "1.86x", "3.38x", "3.8x", "3.51x",
      "2.4x", "4.57x", "1x", "1.72x", "2x", "3.49x", "2.4x", "1.08x", "4.12x", "4.95x",
      "1.01x", "1x", "1.86x", "1.58x", "1x", "1.55x", "5.17x", "1.15x", "1.95x", "7.44x",
      "3.08x", "2.16x", "1.49x", "3.75x", "1.02x", "1.78x", "1.1x", "1.06x", "7.1x", "3.29x",
      "1.35x", "1.27x", "2.07x", "2.29x", "7.6x", "1.47x", "1.28x", "1.6x", "1x", "1.12x",
      "2.26x", "1.6x", "1.16x", "1.65x", "28.51x", "14.41x", "1.31x", "1.14x", "1.76x", "1.02x",
      "1.1x", "1x", "2.64x", "31.76x", "2.66x", "2.24x", "9.42x", "2.8x", "2.24x", "2.89x",
      "1.09x", "1x", "5.12x", "1.23x", "7.8x", "1.04x", "1.01x", "3.77x", "1.17x", "2.26x",
      "7.3x", "1.43x", "4.43x", "1.67x", "3.03x", "1.34x", "1x", "14.31x", "1.38x", "1.08x",
      "20.87x", "1.2x", "1.08x", "1.29x", "2.85x", "4x", "28.19x", "2.93x", "1.04x", "1.79x",
      "1.5x", "2.05x", "2.51x", "1.61x", "1.41x", "1.17x", "1.04x", "1.79x",
      "4.23x", "3.61x", "1.51x", "1x", "1.5x", "11.28x", "2.64x", "1.36x", "5.65x", "1.11x",
      "4.01x", "4.28x", "1.56x", "22.05x", "1.67x", "1.75x", "1.15x", "1.64x", "1.73x", "5.2x",
      "5.09x", "1.49x", "3.63x", "1.27x", "1.4x", "1.95x", "198.73x", "2.38x", "1.13x", "1.06x",
      "2.53x", "163.13x", "29.78x", "12.51x", "11.88x", "5.95x", "3.57x", "2.31x", "1.2x", "1.65x",
      "1.43x", "1.29x", "21.06x", "1.15x", "1.24x", "19.62x", "32.38x", "2.96x", "6.91x", "1x",
      "1.74x", "2.03x", "3.34x", "1.25x", "25.7x", "1.61x", "7.47x", "1.77x", "1.91x", "1.08x",
      "1.17x", "1.35x", "15x", "2.74x", "2.04x", "1.98x", "2.71x", "2.19x", "1.1x", "2.86x",
      "3.11x", "1.46x", "3.21x", "3.68x", "2.99x", "1.34x", "2.04x", "1.27x", "1.3x", "1.02x",
      "2.14x", "1.42x", "1.23x", "3.14x", "146.95x", "1.24x", "1.02x", "1.44x", "1.83x", "9.64x",
      "3.22x", "3.28x", "2.34x", "5.93x", "1.44x", "4.76x", "1.03x", "1.95x", "1.88x", "1.34x",
      "4.91x", "5.06x", "1.7x", "2.5x", "1.74x", "7.17x", "1.86x", "1.13x", "45.11x", "1.67x",
      "1.47x", "20.06x", "1.33x", "3.4x", "1.89x", "1.35x", "1.01x", "3.33x", "1.77x", "1.7x",
      "3.55x", "6.36x", "6.58x", "1.5x", "12.76x", "1.37x", "1.29x", "4.81x", "1.08x", "1.99x",
      "1.37x", "4.19x", "4.35x", "3.87x", "3.64x", "1.05x", "5.86x", "1.1x", "5.9x", "1x",
      "4.54x", "1x", "11.97x", "6.85x", "2.8x", "5.37x", "1.83x", "1.21x", "2.28x", "1.29x",
      "21.2x", "28.16x", "2.02x", "1.6x", "8.74x", "2.33x", "22.66x", "1x", "4.27x", "1.56x",
      "1.16x", "1.41x", "8.87x", "5.17x", "2.97x", "1.18x", "1x", "1.06x", "3.49x", "1.11x",
      "4.76x", "1.51x", "2.03x", "1.21x", "1.25x", "16.7x", "1.13x", "1.55x", "3.23x", "2.37x",
      "1.04x", "1x", "1.33x", "4.91x",
      "11.54x", "2.92x", "5.39x", "6.36x", "5.56x", "3.29x", "1.83x", "2.32x", "1.65x", "1.92x",
      "2.65x", "1.32x", "1.41x", "3.63x", "3.11x", "6.11x", "1.05x", "3.4x", "11.15x", "3.18x",
      "2.92x", "1.88x", "5.21x", "1.35x", "1.5x", "1.23x", "1.44x", "10.45x", "2.53x", "1.25x",
      "2.51x", "3.67x", "1.07x", "1.06x", "7.23x", "1.32x", "1x", "1.23x", "1.52x", "1x",
      "24.46x", "2.58x", "1.29x", "7.59x", "2.2x", "1.06x", "1.27x", "1.42x", "1.1x", "3.65x",
      "73.98x", "1.46x", "1.95x", "2.43x", "1.04x", "2.2x", "1.55x", "1.82x", "1.97x", "1.06x",
      "1.27x", "4.77x", "7.41x", "17.49x", "2.77x", "14.68x", "1.61x", "1.14x", "2.47x", "1.73x",
      "5.42x", "1x", "2.46x", "6.35x", "1.42x", "1.47x", "1.55x", "1.39x", "2.06x", "2.95x",
      "1.25x", "11.55x", "14.29x", "1.05x", "8.72x", "1.14x", "1.35x", "3.06x", "3.31x", "2.94x",
      "1.98x", "1.08x", "1.02x", "1.53x", "1.46x", "1.02x", "1.5x", "5.48x", "3.44x", "1.58x",
      "1.06x", "1.33x", "3.04x", "1.39x", "1.36x", "1.92x", "1.8x", "1.12x", "2.25x", "4.68x",
      "1.49x", "78.81x", "1.36x", "13.27x", "1.16x", "14.09x", "1.48x", "1.16x", "1.25x", "15.19x",
      "1.22x", "1.49x", "1.22x", "1.02x", "1.06x", "3.09x", "1.22x", "1.14x", "1.51x", "2.97x",
      "3.75x", "1.1x", "3.07x", "2.88x", "1.04x", "1.84x", "1.51x", "1.1x", "3.12x", "1.25x",
      "1.12x", "1.38x", "40.89x", "1.49x", "2.18x", "3.96x", "1.58x", "1.72x", "95.58x", "4.85x",
      "2.75x", "1x", "24.47x", "1.82x", "1.61x", "13.89x", "1.23x", "10.51x", "2.54x", "3.29x",
      "1.06x", "1.95x", "1.14x", "1.05x", "1.91x", "1.43x", "2.15x", "1.07x", "2.23x", "1.84x",
      "1.19x", "1.01x", "2.15x", "2.66x", "1.65x", "3.46x", "1.79x", "3.32x", "1.44x", "42.58x",
      "1x", "2x", "1.55x", "1.21x", "4.63x", "4.16x", "2.83x", "6.93x", "3.12x", "5.28x",
      "1.1x", "4.97x", "2.62x", "3.6x",
      "7.16x", "2.05x", "1.35x", "1.63x", "1.8x", "2.12x", "3.96x", "1.14x", "1.69x", "1.16x",
      "1.65x", "3.82x", "1.03x", "1.4x", "1.05x", "1.12x", "1.23x", "1.43x", "1.93x", "1.17x",
      "10.59x", "1.21x", "4.19x", "1.63x", "1.7x", "1.22x", "1x", "1.44x", "1.98x", "4.8x",
      "2.49x", "2.12x", "3.08x", "1.23x", "1.25x", "2.18x", "2.46x", "9.61x", "1.22x", "18.68x",
      "3.09x", "2.45x", "2.09x", "36.31x", "3.88x", "4.27x", "1.13x", "1.01x", "4.32x", "1.17x",
      "2.66x", "2.08x", "28.22x", "1.8x", "6.18x", "1.19x", "2.85x", "1.76x", "1.3x", "1.79x",
      "4.73x", "1.75x", "3x", "2.2x", "2.31x", "1.28x", "2.58x", "3.71x", "1.08x", "4.78x",
      "9.15x", "1.12x", "1.56x", "1.64x", "1.6x", "6.29x", "1.32x", "2.94x", "21.71x", "2.7x",
      "2.1x", "2.73x", "7.09x", "2x", "1.83x", "3.75x", "2.24x", "2.12x", "1x", "1.57x",
      "13.64x", "2.67x", "5.6x", "2.93x", "1.09x", "1.01x", "3.92x", "1.25x", "5.56x", "3.8x",
      "1.79x", "148.73x", "1.06x", "10.1x", "2.09x", "2.02x", "1.34x", "2.98x", "1.18x", "46.46x",
      "3.15x", "1.88x", "1.79x", "1.07x", "1.29x", "1.15x", "2.25x", "7.03x", "1.55x", "1.21x",
      "21.94x", "2.92x", "1.05x", "1.98x", "1.15x", "1.13x", "17.46x", "1.17x", "4.75x", "3.51x",
      "2.83x", "1.43x", "2.63x",
      "6.1x", "10.21x", "3.26x", "1.32x", "3.65x", "1.19x", "1.8x", "15.77x", "1.84x", "1x",
      "3.01x", "5.69x", "15.52x", "58.24x", "8.54x", "51.86x", "1.43x", "2.85x", "4.52x", "1.27x",
      "1.95x", "1.73x", "2.48x", "9.89x", "2.3x", "1.16x", "1.02x", "1.14x", "1.27x", "1.26x",
      "1.31x", "2.61x", "1.28x", "2.07x", "2.65x", "1.46x", "1.27x", "1x", "1.87x", "2.22x",
      "1.44x", "1.36x", "1x", "4.39x", "6.72x", "24.51x", "4.5x", "18.56x", "1.94x", "9.86x",
      "4.21x", "1.56x", "1.37x", "6.94x", "3.62x", "1.12x", "3.74x", "3.23x", "1x", "1.17x",
      "1.31x", "1.56x", "2.7x", "1.52x", "1.02x", "11x", "1.14x", "6.29x", "2.43x", "3.25x",
      "4.74x", "1.5x", "1.15x", "80.28x", "1.09x", "2.28x", "3.88x", "6.12x", "1.52x", "1.42x",
      "1.33x", "1.83x", "41.42x", "1.06x", "1.42x", "2.18x", "4.79x", "1.1x", "1.06x", "4.52x",
      "2.5x", "1.57x", "3.17x", "1.14x", "1.03x", "3.76x", "4.58x", "1.18x", "1x", "1.07x",
      "26.34x", "5.17x", "1.6x", "2.14x", "1x", "9.77x", "1.05x", "1x", "1.1x", "2.52x",
      "2.07x", "1.44x", "1.04x", "1.01x", "1.1x", "1.22x", "1.01x", "1.19x", "1.03x", "2.3x"
    ].map(s => parseFloat(s.replace(/x$/i, '')));
    const LOOP = true;

    // -----------------------------
    // Constants (bankroll logic)
    // -----------------------------
    const INITIAL_BANKROLL = 5000;
    const INITIAL_BET = INITIAL_BANKROLL * 0.015; // => 75
    const MARTI_SEQ = [1.00, 1.37, 1.88, 2.58, 3.54, 4.85, 6.65, 9.12, 12.50];

    // -----------------------------
    // UI helpers (multiplier pill colors)
    // -----------------------------
    const multisWrap = document.getElementById('multis');
    const statusEl = document.getElementById('status');
    const cashoutEl = document.getElementById('cashout');
    const formatMult = (x) => x.toFixed(2);

    function hexToRgba(hex, alpha = 1) {
      let h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const n = parseInt(h, 16);
      const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    function colorForMultiplier(m) {
      if (m < 2) return '#34b4ff';   // < 2
      if (m < 10) return '#913ef8';  // >= 2 and < 10
      return '#c017b4';              // >= 10
    }
    function renderLastMultipliers(list) {
      multisWrap.innerHTML = '';
      // Oldest → newest (left → right)
      list.slice(-10).forEach(m => {
        const primary = colorForMultiplier(m);
        const pill = document.createElement('span');
        pill.className = 'px-2.5 py-1 rounded-full border text-xs mono';
        pill.style.color = primary;
        pill.style.borderColor = primary;
        pill.style.backgroundColor = hexToRgba(primary, 0.15); // 15% bg alpha
        pill.textContent = formatMult(m);
        multisWrap.appendChild(pill);
      });
    }

    // -----------------------------
    // Chart.js setup (dark)
    // -----------------------------
    const ctx = document.getElementById('chart').getContext('2d');
    function gradients(ctx) {
      const { height } = ctx.canvas;
      const g1 = ctx.createLinearGradient(0, 0, 0, height); // indigo
      g1.addColorStop(0, 'rgba(99,102,241,0.35)');
      g1.addColorStop(1, 'rgba(99,102,241,0.05)');

      const g2 = ctx.createLinearGradient(0, 0, 0, height); // emerald
      g2.addColorStop(0, 'rgba(16,185,129,0.35)');
      g2.addColorStop(1, 'rgba(16,185,129,0.05)');

      const g3 = ctx.createLinearGradient(0, 0, 0, height); // amber
      g3.addColorStop(0, 'rgba(245,158,11,0.35)');
      g3.addColorStop(1, 'rgba(245,158,11,0.05)');

      const g4 = ctx.createLinearGradient(0, 0, 0, height); // rose
      g4.addColorStop(0, 'rgba(244,63,94,0.35)');
      g4.addColorStop(1, 'rgba(244,63,94,0.05)');

      return { g1, g2, g3, g4 };
    }
    let { g1, g2, g3, g4 } = gradients(ctx);
    const ro = new ResizeObserver(() => { ({ g1, g2, g3, g4 } = gradients(ctx)); chart.update('none'); });
    ro.observe(ctx.canvas);

    const maxPointsDefault = 120;
    let tick = 0;
    let labels = Array.from({ length: maxPointsDefault }, (_, i) => i - maxPointsDefault);

    // Bankroll states
    let noM_bankroll = INITIAL_BANKROLL;     // fixed 1.5% of initial
    let withM_bankroll = INITIAL_BANKROLL;   // martingale
    let dyn_bankroll = INITIAL_BANKROLL;     // 1.5% of current balance
    let guard_bankroll = INITIAL_BANKROLL;   // guarded martingale

    // Martingale indices
    let withM_martiIdx = 0;
    let guard_martiIdx = 0;

    // Guard state
    let guard_lossStreak = 0;         // consecutive losses while betting
    let guard_cooldown = false;       // true => stop betting
    let guard_resumeCount = 0;        // need 2 qualifying highs to resume

    // Multipliers state
    let usedMultipliers = [];
    let prevMult = null;
    let preloadIdx = 0;

    // Cashout state (live) default 3.7
    let cashout = parseFloat(cashoutEl.value) || 3.7;

    // Visible series (seed flat at initial)
    let noM_series    = Array.from({ length: maxPointsDefault }, () => INITIAL_BANKROLL);
    let withM_series  = Array.from({ length: maxPointsDefault }, () => INITIAL_BANKROLL);
    let dyn_series    = Array.from({ length: maxPointsDefault }, () => INITIAL_BANKROLL);
    let guard_series  = Array.from({ length: maxPointsDefault }, () => INITIAL_BANKROLL);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'No M - LM',
            data: noM_series,
            borderColor: 'rgba(99,102,241,1)',
            backgroundColor: () => g1,
            fill: true,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
          },
          {
            label: 'With M - LM',
            data: withM_series,
            borderColor: 'rgba(16,185,129,1)',
            backgroundColor: () => g2,
            fill: true,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
          },
          {
            label: 'No M - LM (Curr %)',
            data: dyn_series,
            borderColor: 'rgba(245,158,11,1)', // amber
            backgroundColor: () => g3,
            fill: true,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
          },
          {
            label: 'With M - LM (Guard)',
            data: guard_series,
            borderColor: 'rgba(244,63,94,1)', // rose
            backgroundColor: () => g4,
            fill: true,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }
        },
        plugins: {
          legend: { labels: { color: '#cbd5e1' } },
          tooltip: {
            backgroundColor: 'rgba(2,6,23,.95)',
            borderColor: 'rgba(51,65,85,.7)',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
          }
        }
      }
    });

    // -----------------------------
    // Simulation logic (only bet when prev > 1.6; win if curr > cashout)
    // -----------------------------
    const btnToggle     = document.getElementById('btnToggle');
    const btnReset      = document.getElementById('btnReset');
    const btnSettings   = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const settingsClose = document.getElementById('settingsClose');
    const speedEl       = document.getElementById('speed');
    const windowEl      = document.getElementById('window');

    let running = true;
    let interval = null;

    function clampWindow() {
      const maxPoints = parseInt(windowEl.value, 10);
      if (labels.length > maxPoints) {
        labels = labels.slice(-maxPoints);
        chart.data.labels = labels;
        chart.data.datasets.forEach(ds => { ds.data = ds.data.slice(-maxPoints); });
      }
    }

    function nextPreloaded() {
      if (preloadIdx >= PRELOADED.length) {
        if (!LOOP) return null;
        preloadIdx = 0; // loop
      }
      return PRELOADED[preloadIdx++];
    }

    function step() {
      tick++;

      const currMult = nextPreloaded();
      if (currMult == null) { stopLoop(); return; }

      usedMultipliers.push(currMult);
      renderLastMultipliers(usedMultipliers);

      const shouldBet = prevMult !== null && prevMult > 1.6;
      const profitMult = Math.max(0, cashout - 1);

      // --- NO MARTINGALE: fixed 1.5% of initial (R75)
      if (shouldBet) {
        const win = currMult > cashout;
        const bet1 = INITIAL_BET;
        noM_bankroll += win ? bet1 * profitMult : -bet1;
      }

      // --- WITH M - LM: martingale sequence on base 75
      if (shouldBet) {
        const win = currMult > cashout;
        const betM = INITIAL_BET * MARTI_SEQ[withM_martiIdx];
        if (win) {
          withM_bankroll += betM * profitMult;
          withM_martiIdx = 0;
        } else {
          withM_bankroll -= betM;
          if (withM_martiIdx < MARTI_SEQ.length - 1) withM_martiIdx++;
        }
      }

      // --- NO MARTINGALE (Curr %): 1.5% of CURRENT balance
      if (shouldBet) {
        const win = currMult > cashout;
        const dynBet = dyn_bankroll * 0.015;
        dyn_bankroll += win ? dynBet * profitMult : -dynBet;
      }

      // --- WITH M - LM (Guard): martingale + stop/resume logic
      // If in cooldown, don't bet; count qualifying highs to resume.
      if (guard_cooldown) {
        if (shouldBet && currMult > cashout) {
          guard_resumeCount++;
        }
        if (guard_resumeCount >= 2) {
          guard_cooldown = false;
          guard_resumeCount = 0;
          guard_martiIdx = 0;       // resume from base
        }
      } else {
        if (shouldBet) {
          const win = currMult > cashout;
          const betG = INITIAL_BET * MARTI_SEQ[guard_martiIdx];
          if (win) {
            guard_bankroll += betG * profitMult;
            guard_martiIdx = 0;
            guard_lossStreak = 0;   // reset streak on win
          } else {
            guard_bankroll -= betG;
            if (guard_martiIdx < MARTI_SEQ.length - 1) guard_martiIdx++;
            guard_lossStreak++;
            if (guard_lossStreak > 7) {
              // Enter cooldown
              guard_cooldown = true;
              guard_lossStreak = 0;
              guard_martiIdx = 0;  // reset progression while paused
            }
          }
        }
      }

      // Append points
      labels.push(tick);
      chart.data.datasets[0].data.push(noM_bankroll);
      chart.data.datasets[1].data.push(withM_bankroll);
      chart.data.datasets[2].data.push(dyn_bankroll);
      chart.data.datasets[3].data.push(guard_bankroll);
      clampWindow();
      chart.update('none');

      // Status line (brief)
      let guardState = guard_cooldown ? ` • guard: cooldown (resume hits: ${guard_resumeCount}/2)` : '';
      if (prevMult === null) {
        statusEl.textContent = `Round ${tick}: first round (no bet) • curr=${currMult.toFixed(2)} • cashout=${cashout.toFixed(2)}${guardState}`;
      } else {
        statusEl.textContent = `Round ${tick}: prev=${prevMult.toFixed(2)} • curr=${currMult.toFixed(2)} • cashout=${cashout.toFixed(2)}${guardState}`;
      }

      prevMult = currMult;
    }

    function startLoop() {
      stopLoop();
      const delay = Math.round(parseInt(speedEl.value, 10) * 1.5); // 1.5× slower
      interval = setInterval(step, delay);
    }
    function stopLoop() { if (interval) { clearInterval(interval); interval = null; } }

    // Init
    renderLastMultipliers([]);
    startLoop();

    // Controls
    btnToggle.addEventListener('click', () => {
      running = !running;
      btnToggle.textContent = running ? 'Pause' : 'Resume';
      running ? startLoop() : stopLoop();
    });
    speedEl.addEventListener('input', () => { if (running) startLoop(); });
    windowEl.addEventListener('change', () => { clampWindow(); chart.update(); });
    cashoutEl.addEventListener('input', () => {
      const v = parseFloat(cashoutEl.value);
      if (!isNaN(v) && v > 1) cashout = v;
    });

    btnReset.addEventListener('click', () => {
      tick = 0;
      noM_bankroll = INITIAL_BANKROLL;
      withM_bankroll = INITIAL_BANKROLL;
      dyn_bankroll = INITIAL_BANKROLL;
      guard_bankroll = INITIAL_BANKROLL;

      withM_martiIdx = 0;
      guard_martiIdx = 0;
      guard_lossStreak = 0;
      guard_cooldown = false;
      guard_resumeCount = 0;

      usedMultipliers = [];
      prevMult = null;
      preloadIdx = 0;

      cashout = parseFloat(cashoutEl.value) || 3.7;

      const maxPoints = parseInt(windowEl.value, 10);
      labels = Array.from({ length: maxPoints }, (_, i) => i - maxPoints);
      chart.data.labels = labels;

      chart.data.datasets[0].data = Array.from({ length: maxPoints }, () => INITIAL_BANKROLL);
      chart.data.datasets[1].data = Array.from({ length: maxPoints }, () => INITIAL_BANKROLL);
      chart.data.datasets[2].data = Array.from({ length: maxPoints }, () => INITIAL_BANKROLL);
      chart.data.datasets[3].data = Array.from({ length: maxPoints }, () => INITIAL_BANKROLL);

      statusEl.textContent = '';
      renderLastMultipliers([]);
      chart.update();

      if (!running) { running = true; btnToggle.textContent = 'Pause'; }
      startLoop();
    });

    if (btnSettings && settingsModal) {
      const openSettings = () => {
        settingsModal.classList.remove('hidden');
        settingsModal.setAttribute('aria-hidden', 'false');
      };
      const closeSettings = () => {
        settingsModal.classList.add('hidden');
        settingsModal.setAttribute('aria-hidden', 'true');
      };
      btnSettings.addEventListener('click', openSettings);
      if (settingsClose) settingsClose.addEventListener('click', closeSettings);
      settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); });
    }

    window.addEventListener('beforeunload', stopLoop);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
