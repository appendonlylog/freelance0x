// Temporarily use hash history instead of history/createBrowserHistory to
// allow deep linking as GitHub pages doesn't support custom serving rules.
import createHistory from 'history/createHashHistory'

const history = createHistory()

export default history
