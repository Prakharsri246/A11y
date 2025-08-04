# A11y Analyzer Tool

## Overview
The **A11y Analyzer Tool** is a web accessibility and performance scanner built using Node.js, Express, Puppeteer, Pa11y, Lighthouse, and Axe. It scans a given URL for accessibility issues, performance gaps, and best practices compliance.

## Features
- **Accessibility Analysis**:
  - Uses Axe and Pa11y to identify accessibility violations.
- **Performance Analysis**:
  - Uses Lighthouse to evaluate performance, accessibility, SEO, and best practices.
- **Detailed Reporting**:
  - Provides scores and lists of issues for each tool.

## Installation

### Prerequisites
- Node.js v22.2.0 or higher
- npm (comes with Node.js)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/a11y.git
   cd a11y