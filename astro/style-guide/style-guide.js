export default {
  id: 'style-guide',
  name: 'Toggle Style Guide',
  // https://icon-sets.iconify.design/ic/round-style/
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61m19.5-3.7L17.07 3.98a2.013 2.013 0 0 0-1.81-1.23c-.26 0-.53.04-.79.15L7.1 5.95a1.999 1.999 0 0 0-1.08 2.6l4.96 11.97a1.998 1.998 0 0 0 2.6 1.08l7.36-3.05a1.994 1.994 0 0 0 1.09-2.6M7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1m-2 11c0 1.1.9 2 2 2h1.45l-3.45-8.34z"/></svg>',
  init(_, eventTarget) {
    eventTarget.addEventListener('app-toggled', (event) => {
      if (event.detail.state === true) {
        const styleGuide = document.createElement('div');
        styleGuide.setAttribute('class', 'p-2 bg-body');
        styleGuide.setAttribute('id', 'style-guide');
        styleGuide.innerHTML = `
<ul class="nav nav-tabs" id="style-guide-tabs" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="style-guide-description" data-bs-toggle="tab" data-bs-target="#style-guide-description-pane" type="button" role="tab" aria-controls="style-guide-description-pane" aria-selected="true">
      <h2 class="mb-0" style="font-size: 1.1em;">Style Guide</h2>
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="style-guide-headers" data-bs-toggle="tab" data-bs-target="#style-guide-headers-pane" type="button" role="tab" aria-controls="style-guide-headers-pane" aria-selected="false">
      Headers
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="style-guide-text" data-bs-toggle="tab" data-bs-target="#style-guide-text-pane" type="button" role="tab" aria-controls="style-guide-text-pane" aria-selected="false">
      Typography
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="style-guide-spacing" data-bs-toggle="tab" data-bs-target="#style-guide-spacing-pane" type="button" role="tab" aria-controls="style-guide-spacing-pane" aria-selected="false">
      Spacing
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="style-guide-themes" data-bs-toggle="tab" data-bs-target="#style-guide-themes-pane" type="button" role="tab" aria-controls="style-guide-themes-pane" aria-selected="false">
      Themes
    </button>
  </li>
  <li class="ms-auto nav-item me-1 my-1" role="presentation">
    <button class="btn-close" id="style-guide-close" aria-label="Close Style Guide"></button>
  </li>
</ul>

<div class="tab-content border-start border-end border-bottom p-3" id="style-guide-panes">
  <div class="tab-pane fade show active" id="style-guide-description-pane" role="tabpanel" aria-labelledby="style-guide-description" tabindex="0">
    <div class="row justify-content-center">
      <div class="col col-md-8 text-center">
        This is the style guide for this website. It includes the components, elements, colors and other styles that should be used
        when writing components. Anything found in this style guide should be defined globally for use on any page or component.
      </div>
    </div>
  </div>

  <div class="tab-pane fade" id="style-guide-headers-pane" role="tabpanel" aria-labelledby="style-guide-headers" tabindex="0">
    <div class="row mh-50 overflow-y-scroll">
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

  <div class="tab-pane fade" id="style-guide-text-pane" role="tabpanel" aria-labelledby="style-guide-text" tabindex="0">
    <div class="row mh-50 overflow-y-scroll">
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

  <div class="tab-pane fade" id="style-guide-spacing-pane" role="tabpanel" aria-labelledby="style-guide-spacing" tabindex="0">
    <div class="accordion-body row mh-50 overflow-y-scroll align-items-center">
      <div class="col col-lg-7">
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
      </div>
      <div class="col col-lg-5">
        <p class="text-center">Padding and Margin levels 5-1. <br />Padding: <code>p-5</code> &rarr; <code>p-1</code>. Margins: <code>m-5</code> &rarr; <code>m-1</code>.</p>
        <p>
          Include vertical space between parts of the page.
          Modern design style does not compress <code>line-height</code> and leaves extra vertical padding and margin between areas.
          As a result, leave enough horizontal space so that the vertical space doesn't look out of place.
        </p>
      </div>
    </div>
  </div>

  <div class="tab-pane fade" id="style-guide-themes-pane" role="tabpanel" aria-labelledby="style-guide-themes" tabindex="0">
    <ul class="small list-inline list-unstyled text-center">
      <li class="list-inline-item p-2 m-1 text-body bg-body border border-3 rounded">
        body
      </li>
      <li class="list-inline-item p-2 m-1 bg-body text-body-emphasis border border-primary border-3 rounded">
        body-primary
      </li>
      <li class="list-inline-item p-2 m-1 bg-body-secondary text-body-secondary border border-secondary border-3 rounded">
        body-secondary
      </li>
      <li class="list-inline-item p-2 m-1 bg-body-tertiary text-body-tertiary border border-tertiary border-3 rounded">
        body-tertiary
      </li>
      <div class="vr"></div>
      <li class="list-inline-item p-2 m-1 text-bg-primary border border-primary border-3 rounded">
        primary
      </li>
      <li class="list-inline-item p-2 m-1 bg-primary-subtle text-primary-emphasis border border-primary-subtle border-3 rounded">
        primary-subtle
      </li>
      <div class="vr"></div>
      <li class="list-inline-item p-2 m-1 text-bg-secondary border border-secondary border-3 rounded">
        secondary
      </li>
      <li class="list-inline-item p-2 m-1 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle border-3 rounded">
        secondary-subtle
      </li>
      <div class="vr"></div>
      <li class="list-inline-item p-2 m-1 text-bg-info border border-info border-3 rounded">
        info
      </li>
      <li class="list-inline-item p-2 m-1 text-info-emphasis bg-info-subtle border border-info-subtle border-3 rounded">
        info-subtle
      </li>
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
      }
      else {
        const styleGuide = document.getElementById("style-guide");
        if (styleGuide)
          styleGuide.remove();
      }
    })
  },
};
