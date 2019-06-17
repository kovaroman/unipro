// =======================
// DO NOT CHANGE THIS FILE
// =======================

const randomDelay = () => Math.floor(Math.random() * 5)

const poller = el => {
  console.log('UNIPRO: poller')
  return new Promise((resolve, reject) => {
    const pollforEl = setInterval(() => {
      const domElement = document.querySelector(el)
      if (domElement) {
        console.log('UNIPRO: Element found by poller')
        resolve({ domElement, pollforEl })
      }
    }, 300)
    setTimeout(() => {
      reject('UNIPRO: Poller conditions were not met')
    }, 15000)
  })
}

const emitCustomGoal = goal => {
  return new Promise((resolve, reject) => {
    if (goal.toLowerCase() === 'completed' || goal.toLowerCase() === 'removed') {
      setTimeout(() => resolve(`UNIPRO: Goal "${goal}" has been incremented`), 500)
    } else {
      reject(`UNIPRO: Goal hasn't been recognised`)
    }
  })
}

const removeInterval = intervalName => {
  console.log('UNIPRO: removeInterval', intervalName)
  clearInterval(intervalName)
}

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.createElement('div')
  appElement.classList.add('app')
  appElement.innerHTML = 'INSIDE THIS ELEMENT WE EXPECT TO SEE YOUR APP'
  setTimeout(() => {
    console.log('UNIPRO: .app element added to DOM')
    document.querySelector('body').appendChild(appElement)
  }, randomDelay() * 1000)
})
