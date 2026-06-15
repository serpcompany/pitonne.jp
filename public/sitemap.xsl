<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>Sitemap — Pitonne</title>
        <meta name="robots" content="noindex,nofollow"/>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fafaf9;line-height:1.6}
          .container{max-width:960px;margin:0 auto;padding:2rem 1.5rem}
          h1{font-size:1.5rem;font-weight:600;margin-bottom:.25rem;color:#0c0a09}
          .subtitle{color:#78716c;font-size:.875rem;margin-bottom:2rem}
          .subtitle a{color:#b45309;text-decoration:none}
          .subtitle a:hover{text-decoration:underline}
          .stats{display:flex;gap:1.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
          .stat{background:#fff;border:1px solid #e7e5e4;border-radius:.5rem;padding:.75rem 1rem}
          .stat-label{font-size:.75rem;color:#a8a29e;text-transform:uppercase;letter-spacing:.05em}
          .stat-value{font-size:1.25rem;font-weight:600;color:#0c0a09}
          table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e7e5e4;border-radius:.5rem;overflow:hidden;font-size:.8125rem}
          thead{background:#f5f5f4}
          th{text-align:left;padding:.625rem .75rem;font-weight:600;color:#57534e;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e7e5e4}
          td{padding:.5rem .75rem;border-bottom:1px solid #f5f5f4;vertical-align:top}
          tr:last-child td{border-bottom:none}
          tr:hover{background:#fafaf9}
          .url{color:#b45309;text-decoration:none;word-break:break-all}
          .url:hover{text-decoration:underline}
          .badge{display:inline-block;padding:.125rem .5rem;border-radius:9999px;font-size:.6875rem;font-weight:500}
          .badge-weekly{background:#fef3c7;color:#92400e}
          .badge-monthly{background:#e0e7ff;color:#3730a3}
          .badge-daily{background:#dcfce7;color:#166534}
          .badge-yearly{background:#f3e8ff;color:#6b21a8}
          .priority-high{color:#166534;font-weight:600}
          .priority-mid{color:#92400e}
          .priority-low{color:#78716c}
          .alt-links{display:flex;gap:.375rem;flex-wrap:wrap}
          .alt-link{display:inline-block;padding:.125rem .375rem;border-radius:.25rem;font-size:.6875rem;text-decoration:none;font-weight:500;border:1px solid #e7e5e4;color:#57534e}
          .alt-link:hover{background:#f5f5f4}
          .alt-link .lang{font-weight:600;color:#0c0a09}
          @media(max-width:640px){
            .container{padding:1rem}
            table{font-size:.75rem}
            th,td{padding:.375rem .5rem}
            .hide-mobile{display:none}
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sitemap</h1>
          <p class="subtitle">
            <a href="https://pitonne.jp">pitonne.jp</a>
            <xsl:text> — </xsl:text>
            <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
            <xsl:text> URLs</xsl:text>
          </p>
          <table>
            <thead>
              <tr>
                <th style="width:3rem">#</th>
                <th>URL</th>
                <th class="hide-mobile" style="width:5.5rem">Freq</th>
                <th class="hide-mobile" style="width:4.5rem">Priority</th>
                <th class="hide-mobile" style="width:8rem">Alternates</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td style="color:#a8a29e">
                    <xsl:value-of select="position()"/>
                  </td>
                  <td>
                    <a class="url" href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td class="hide-mobile">
                    <xsl:choose>
                      <xsl:when test="sitemap:changefreq='weekly'">
                        <span class="badge badge-weekly">weekly</span>
                      </xsl:when>
                      <xsl:when test="sitemap:changefreq='daily'">
                        <span class="badge badge-daily">daily</span>
                      </xsl:when>
                      <xsl:when test="sitemap:changefreq='yearly'">
                        <span class="badge badge-yearly">yearly</span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="badge badge-monthly">monthly</span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="hide-mobile">
                    <xsl:choose>
                      <xsl:when test="sitemap:priority &gt;= 0.8">
                        <span class="priority-high"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority &gt;= 0.5">
                        <span class="priority-mid"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority-low"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="hide-mobile">
                    <div class="alt-links">
                      <xsl:for-each select="xhtml:link[@rel='alternate']">
                        <a class="alt-link" href="{@href}">
                          <span class="lang"><xsl:value-of select="@hreflang"/></span>
                        </a>
                      </xsl:for-each>
                    </div>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
