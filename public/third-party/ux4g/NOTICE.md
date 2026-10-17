# UX4G software attribution

Upstream: UX4G Design System, ux4g-negd. Official site: https://www.ux4g.gov.in/components . Repository: https://github.com/ux4g-negd/web_design_system . npm: ux4g-web-components, exact version3.0.2; integrity recorded in package-lock.json. Upstream CSS SHA256 is pinned in scripts/ux4g.config.mjs. The distributed README explicitly declares MIT; an unchanged copy is preserved as UPSTREAM-README.md. The package does not supply a separate copyright notice or LICENSE file; no ownership notice is invented here.

Adaptation: seven embedded font-face declarations and one Google Fonts import removed. All style rules and declarations are retained; only :root is mapped to :scope to host scoped tokens. Other selectors are unchanged. The CSS is then wrapped in @scope (.sahmati-ux) and @layer ux4g. Local Inter and Mukta retain their separately distributed font licenses. No UX4G DOM runtime is loaded. Government artwork is not displayed or used as Sahmati branding, and no endorsement is claimed. UI acceptance remains Sahmati's responsibility.

## MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
