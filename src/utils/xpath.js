const getXPathForElement = (element) => {
  if (element.id !== '') {
    return 'id("' + element.id + '")'
  }
  if (element === document.body) {
    return element.tagName.toLowerCase()
  }

  let siblingIndex = 0
  for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
    if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
      siblingIndex++
    }
  }

  return (
    getXPathForElement(element.parentNode) +
    '/' +
    element.tagName.toLowerCase() +
    '[' +
    (siblingIndex + 1) +
    ']'
  )
}

const getElementByXPath = (xpath) => {
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
  return result.singleNodeValue
}

export { getXPathForElement, getElementByXPath }
