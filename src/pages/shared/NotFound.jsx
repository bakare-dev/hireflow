import { Link } from 'react-router'
import { ROUTES } from '../../constants/routes'
import Button from '../../components/common/Button'

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        We could not find what you were looking for.
      </p>
      <Link to={ROUTES.LANDING} className="mt-6 inline-block">
        <Button variant="secondary">Back home</Button>
      </Link>
    </div>
  )
}

export default NotFound
