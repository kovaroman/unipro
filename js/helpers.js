export const dom = {
  /**
   * Create element
   *
   * @param {string} tagName
   * @param {Object} attrs
   * @return {Element} The created element
   */
  create(tagName, attrs) {
    const el = document.createElement(tagName);

    if (attrs && typeof attrs === 'object') {
      for (const attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
          el.setAttribute(attr, attrs[attr]);
        }
      }
    }

    return el;
  },

  /**
   * Attributes getter / setter
   *
   * @param {Element} elem
   * @param {string} name
   * @param {*} [value]
   * @return {*}
   */
  attr(elem, name, value) {
    if (elem && elem instanceof window.Element) {
      if (name && !value) {
        return elem.getAttribute(name);
      } else if (name && value) {
        elem.setAttribute(name, value);
      }
    }
  },

  /**
   * Append element as last child
   *
   * @param {Element} elem
   * @param {Element} child
   */
  append(elem, child) {
    if (elem && child && elem instanceof window.Element
      && child instanceof window.Element
    ) {
      elem.appendChild(child);
    }
  },

  /**
   * Prepend element as first child
   *
   * @param {Element} elem
   * @param {Element} child
   */
  prepend(elem, child) {
    if (elem && child && elem instanceof window.Element
      && child instanceof window.Element
    ) {
      elem.insertBefore(child, elem.firstChild);
    }
  },

  /**
   * Detach element from dom
   *
   * @return {Element} The detached element
   */
  remove(elem) {
    if (elem && elem instanceof window.Element) {
      elem.parentNode.removeChild(elem);
    }
    return elem;
  }
};

/**
 * Ajax helper.
 * @param {string} url
 * @param {*} data
 * @param {string} method
 * @param {boolean} async
 * @returns {Promise<any>}
 */
export function ajax(url, data = null, method = 'GET', async = true) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, async)
    if (data) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;

      if (xhr.status === 200 || xhr.status === 201) {
        if (xhr.responseText) {
          try {
            const result = JSON.parse(xhr.responseText)
            resolve(result)
            return
          } catch (e) {
            // TODO: can log error.
          }
        }

        reject(xhr.status + ': ' + xhr.statusText + ', ' + xhr.responseText);
      } else {
        reject(xhr.status + ': ' + xhr.statusText);
      }
    }
  })
}