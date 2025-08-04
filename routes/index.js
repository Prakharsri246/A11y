const express = require('express');
const puppeteer = require('puppeteer');
const pa11y = require('pa11y');
const path = require('path');

const router = express.Router();

router.get('/scan', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL query parameter' });

  try {
    // ───────────────────────────────
    // Puppeteer + Axe
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const axePath = path.join(__dirname, '..', 'public', 'axe.min.js');
    await page.addScriptTag({ path: axePath });

    const axeResults = await page.evaluate(async () => await axe.run(document));
    await browser.close();

    const filteredAxe = axeResults.violations.filter(v =>
      ['serious', 'moderate'].includes(v.impact)
    );

    // ───────────────────────────────
    // Pa11y
    const pa11yResults = await pa11y(url, {
      standard: 'WCAG2AA',
      timeout: 30000,
    });

    const filteredPa11y = pa11yResults.issues.filter(issue =>
      ['error', 'warning'].includes(issue.type)
    );

    // ───────────────────────────────
    // Lighthouse + ChromeLauncher via dynamic import
    const { default: lighthouse } = await import('lighthouse');
    const { launch } = await import('chrome-launcher');

    const chrome = await launch({ chromeFlags: ['--headless'] });

    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };

    const lhResult = await lighthouse(url, options);
    const categories = lhResult.lhr.categories;

    const performanceGaps = lhResult.lhr.audits;
    const gapList = Object.values(performanceGaps)
      .filter(a => a.score !== null && a.score < 0.9)
      .map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        score: a.score,
      }));

    await chrome.kill();

    // ───────────────────────────────
    // Final Response
    res.json({
      score: {
        axe: 100 - filteredAxe.length * 2,
        pa11y: 100 - filteredPa11y.length * 2,
        lighthouse: {
          performance: categories.performance.score * 100,
          accessibility: categories.accessibility.score * 100,
          bestPractices: categories['best-practices'].score * 100,
          seo: categories.seo.score * 100,
        },
      },
      gaps: {
        lighthouse: gapList,
      },
      issues: {
        axe: filteredAxe,
        pa11y: filteredPa11y,
      },
    });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Scan failed', details: err.message });
  }
});

module.exports = router;
