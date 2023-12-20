export default {
  id: 'style-guide',
  name: 'Toggle Style Guide',
  // https://icon-sets.iconify.design/ic/round-style/
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61m19.5-3.7L17.07 3.98a2.013 2.013 0 0 0-1.81-1.23c-.26 0-.53.04-.79.15L7.1 5.95a1.999 1.999 0 0 0-1.08 2.6l4.96 11.97a1.998 1.998 0 0 0 2.6 1.08l7.36-3.05a1.994 1.994 0 0 0 1.09-2.6M7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1m-2 11c0 1.1.9 2 2 2h1.45l-3.45-8.34z"/></svg>',
  init(_, eventTarget) {
    eventTarget.addEventListener('app-toggled', (event) => {
      if (event.detail.state === true) {
        const styleGuide = document.createElement('div');
        styleGuide.setAttribute('class', 'p-2 bg-ac');
        styleGuide.setAttribute('id', 'style-guide');
        styleGuide.innerHTML = `
<div class="accordion">
  <div class="accordion-item list-group rounded-0">
    <h2 class="accordion-header">
      <div class="list-group-item d-flex justify-content-between align-items-center" style="font-size: 1.2rem">
        <strong>Style Guide</strong>
        <button id="style-guide-close" class="btn-close" style="font-size: 1rem" aria-label="Close Style Guide"></button>
      </div>
    </h2>
  </div>
  <div class="accordion-item">
    <h3 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#style-guide-headers" aria-expanded="false" aria-controls="style-guide-headers">
        Typography: Headers &amp; Display
      </button>
    </h3>
    <div id="style-guide-headers" class="accordion-collapse collapse" data-bs-parent="#style-guide">
      <div class="accordion-body row">
        <div class="col col-md-6">
          <p>The standard headings for use.</p>
          <p class="h1">Heading 1 (Up in breadcrumbs)</p>
          <p class="h2">Heading 2</p>
          <p class="h3">Heading 3</p>
          <p class="h4">Heading 4</p>
          <p class="h5">Heading 5</p>
          <p class="h6">Heading 6</p>
        </div>
        <hr class="d-md-none" />
        <div class="col col-md-6">
          <p>The display titles are designed for when additional visual emphasis is needed on a header. These aren't meant to be used for normal text.</p>
          <p class="display-1">Display 1</p>
          <p class="display-2">Display 2</p>
          <p class="display-3">Display 3</p>
          <p class="display-4">Display 4</p>
          <p class="display-5">Display 5</p>
          <p class="display-6">Display 6</p>
          <p class="display-65">Display 65</p>
          <p class="display-7">Display 7</p>
        </div>
      </div>
    </div>
  </div>
  <div class="accordion-item">
    <h3 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#style-guide-text" aria-expanded="false" aria-controls="style-guide-text">
        Typography: Text &amp; Content
      </button>
    </h3>
    <div id="style-guide-text" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body row">
        <div class="col col-md-6">
          <p>A normal paragraph: One that displays the standard normal font that used for the majority of text on the site. <strong>Bold text should be used for emphasis</strong>. Italics should never be used, and underlines only for links. <code>Code elements</code> should be used when describing technical content.</p>
          <hr />
          <p class="lead">Lead Paragraph: One that's designed for callouts or extra attention. <strong>Bold text should be used for extra emphasis</strong>.</p>            
        </div>
        <hr class="d-md-none" />
        <div class="col col-md-6">
          <p class="small">A small paragraph: One used for less notable details and other facts. <span class="text-muted">This text may be muted to further reduce the visual impact on the page.</span></p>
          <hr />
          <figure>
            <blockquote class="blockquote">
              <p>Quotes or testimonials should be contained in a <code>blockquote</code> element in a <code>figure</code>.</p>
            </blockquote>
            <figcaption class="blockquote-footer">
              The attribution of the quote or testmonial.
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  </div>
  <div class="accordion-item">
    <h3 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#style-guide-spacing" aria-expanded="false" aria-controls="style-guide-spacing">
        Spacing: Margins &amp; Padding
      </button>
    </h3>
    <div id="style-guide-spacing" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body">
        <div class="card p-5 bg-body-secondary">
          <div class="card p-4 bg-body-tertiary">
            <div class="card p-3">
              <div class="card p-2 bg-body-tertiary">
                <div class="card p-1">
                  <div class="card"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="text-center">Padding and Margin levels 1-5.</p>
      </div>
    </div>
  </div>
  <div class="accordion-item">
    <h3 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#style-guide-colors" aria-expanded="false" aria-controls="style-guide-colors">
        Colors
      </button>
    </h3>
    <div id="style-guide-colors" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body d-flex justify-content-center gap-2">
        <div>
          <div class="rounded border border-ac">&nbsp; &nbsp;</div>
          <span>(default)</span>
        </div>
        <div>
          <div class="rounded border bg-ac">&nbsp; &nbsp;</div>
          <span><code>ac</code> (Our brand)</span>
        </div>
        <div>
          <div class="rounded border border-ac bg-body-secondary">&nbsp; &nbsp;</div>
          <code>body-secondary</code>
        </div>
        <div>
          <div class="rounded border border-ac bg-body-tertiary">&nbsp; &nbsp;</div>
          <code>body-tertiary</code>
        </div>
      </div>
    </div>
  </div>
</div>`;
    
        const header = document.getElementsByTagName("header").item(0);
        header.appendChild(styleGuide);

        const closeButton = document.getElementById("style-guide-close");
        closeButton.onclick = () => {
          eventTarget.dispatchEvent(
            new CustomEvent('toggle-app', {
              detail: {
                state: false,
              },
            })
          );
        }
  
        // For some reason, this is working without the include.
        // If it stops, include the following:
        // Array.from(document.querySelectorAll('.accordion'))
        //   .forEach(node => new Accordion(node));
      }
      else {
        const styleGuide = document.getElementById("style-guide");
        if (styleGuide)
          styleGuide.remove();
      }
    })
  },
};
