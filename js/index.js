// use json-server for local server and db.json as Database

// Your task app should be a direct child of ".app" element.
// .app element will be injected into DOM between 1-15 seconds

// Supplied functions
// - poller - check for elements on the page(return promise), takes one param - element class/id (.class or #id)
// - emitCustomGoal - to emit goals(return promise), takes one param - goal name
// - removeInterval - clean intervals

import '../styles/normalize.css'
import '../styles/index.scss'
import { poller, emitCustomGoal, removeInterval } from './setup'
import { dom, ajax } from './helpers'

const myApp = {
  // Url for API
  opts: {
    backendUrl: 'http://localhost:3000'
  },

  // Text for different LANGs, can be loaded at the beginning
  texts: {
    save: 'Save',
    removeAll: 'Remove all',
    createPlaceholder: 'Create new todo',
    emptyError: 'Enter some text to create a todo',
    error: 'Something went wrong...'
  },

  // Routes for API
  routes: {
    todos: '/todos',
    statistics: '/statistics'
  },

  // Stats for tracking
  statistics: {
    'completed': 0,
    'deleted': 0
  },

  /**
   * Get route
   * @param {string} name
   * @returns {string}
   */
  getRoute(name) {
    return this.routes[name] ? this.opts.backendUrl + this.routes[name] : '';
  },

  /**
   * Init app with the root element
   * @param {Element} rootEl
   */
  init(rootEl) {
    const wrap = dom.create('div', {class: 'app-wrap'})
    dom.append(wrap, this.createHeader())
    dom.append(wrap, this.createBody())

    rootEl.innerHTML = ''
    dom.append(rootEl, wrap)

    this.loadTasks()
  },

  /**
   * Create header elements and listen for save click
   * @returns {*|Element}
   */
  createHeader() {
    const elHeader = dom.create('div', {class: 'header'})
    const elAddWr = dom.create('div', {class: 'add-wrap'})
    const elInput = dom.create('input', {class: 'add-input', type: 'text', placeholder: this.texts.createPlaceholder})
    const elBtn = dom.create('button', {class: 'add-button btn'})
    elBtn.innerHTML = this.texts.save
    elBtn.addEventListener('click', function() {
      this.createTask(elInput.value)
      elInput.value = '';
    }.bind(this), false);

    dom.append(elAddWr, elInput)
    dom.append(elAddWr, elBtn)
    dom.append(elHeader, elAddWr)

    return elHeader
  },

  /**
   * Create body elements and listen for deleteAll click
   * @returns {*|Element}
   */
  createBody() {
    const elContent = dom.create('div', {class: 'content'})
    const elTaskList = dom.create('div', {class: 'task-list'})
    const elBtn = dom.create('button', {class: 'remove-all-button btn'})
    elBtn.innerHTML = this.texts.removeAll
    elBtn.addEventListener('click', async function() {
      const els = document.querySelectorAll('.task-wrap');

      if (els) {
        const elements = Array.from(els)
        for (let index = 0; index < elements.length; index++) {
          const id = elements[index].id.replace('task-', '')
          try {
            await this.deleteTask(id);
          } catch (e) {
            alert(this.texts.error)
          }

          dom.remove(elements[index])
        }
      }
    }.bind(this), false);

    dom.append(elContent, elBtn)
    dom.append(elContent, elTaskList)

    return elContent
  },

  /**
   * Load all todos
   */
  loadTasks() {
    // Load statistics.
    ajax(this.getRoute('statistics')).then(response => {
      this.statistics = response
    });

    // Using poller, but it has interval that slows start of request.
    poller('.app .content .task-list').then(result => {
      if (result.pollforEl) {
        removeInterval(result.pollforEl)
      }

      if (result.domElement) {
        ajax(this.getRoute('todos')).then(response => {
          this.createItems(response, result.domElement)
        }).catch(text => alert(text))
      }
    })
  },

  /**
   * Create todo item, listen for remove and complete click
   * @param {Array} todos
   * @param {Element} container
   */
  createItems(todos, container) {
    todos.forEach(item => {
      const elText = dom.create('span', {class: 'task-title'})
      elText.innerHTML = item.text || ''
      elText.addEventListener('click', function() {
        if (item.status !== 'completed') {
          this.completeTask(item.id).then(() => {
            poller('#task-' + item.id).then(result => {
              if (result.pollforEl) {
                removeInterval(result.pollforEl)
              }

              if (result.domElement) {
                dom.attr(result.domElement, 'class', 'task-wrap completed')
              }
            })
          }).catch(text => alert(text))
        }
      }.bind(this), false);

      const elDelete = dom.create('button', {class: 'task-delete btn'})
      elDelete.addEventListener('click', function() {
        this.deleteTask(item.id).then(() => {
          poller('#task-' + item.id).then(result => {
            if (result.pollforEl) {
              removeInterval(result.pollforEl)
            }

            if (result.domElement) {
              dom.remove(result.domElement)
            }
          })
        }).catch(text => alert(text))
      }.bind(this), false);

      const elTask = dom.create('div', {
        id: 'task-' + item.id,
        class: 'task-wrap' + (item.status === 'completed' ? ' completed' : '')
      })
      dom.append(elTask, elText)
      dom.append(elTask, elDelete)
      dom.append(container, elTask)
    })
  },

  /**
   * Create todo item
   * @param {string} text
   */
  createTask(text) {
    if (text) {
      // Using poller, but it has interval that slows start of request.
      poller('.app .content .task-list').then(result => {
        if (result.pollforEl) {
          removeInterval(result.pollforEl)
        }

        if (result.domElement) {
          ajax(this.getRoute('todos'), { text, status: 'new' }, 'POST').then(response => {
            this.createItems([response], result.domElement)
          }).catch(text => alert(text))
        }
      })
    } else {
      alert(this.texts.emptyError)
    }
  },

  /**
   * Delete todo item, save stats and trigger goal
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  deleteTask(id) {
    return new Promise((resolve, reject) => {
      if (id) {
        ajax(this.getRoute('todos') + '/' + id, null, 'DELETE').then(() => {
          this.statistics.deleted += 1;
          this.saveStats().then(() => emitCustomGoal('removed'))
          resolve()
        }).catch(text => alert(text))
      } else {
        reject()
      }
    })
  },

  /**
   * Complete todo item, save stats and trigger goal
   * @param {string|number} id
   * @returns {Promise<any>}
   */
  completeTask(id) {
    return new Promise((resolve, reject) => {
      if (id) {
        ajax(this.getRoute('todos') + '/' + id, { status: 'completed' }, 'PATCH').then(response => {
          if (response.id) {
            this.statistics.completed += 1;
            this.saveStats().then(() => emitCustomGoal('completed'))
            resolve()
          }
        }).catch(text => alert(text))
      } else {
        reject()
      }
    })
  },

  /**
   * Save stats
   * @returns {Promise<any>}
   */
  saveStats() {
    return ajax(this.getRoute('statistics'), this.statistics, 'POST')
  }
}

// Run app
if (poller) {
  poller('body > .app').then(result => {
    if (result.pollforEl) {
      removeInterval(result.pollforEl)
    }

    if (result.domElement) {
      myApp.init(result.domElement)
    }
  })
}