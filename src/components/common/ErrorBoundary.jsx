import { Component } from 'react'

/**
 * Stops one broken component taking the whole screen down.
 *
 * On a kiosk a white screen is the worst possible failure: nobody is
 * watching a console, and a visitor's only recourse is to walk away. A
 * decorative widget throwing should cost its own box, not the experience
 * around it.
 *
 * Renders `fallback` (default: nothing) in place of the subtree.
 */
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // Kept so a problem is still visible to anyone with the tablet
    // plugged into a laptop, without surfacing anything to the visitor.
    console.error('Component failed and was isolated:', error)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
