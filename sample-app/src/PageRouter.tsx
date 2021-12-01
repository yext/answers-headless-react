import { ComponentType } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

interface RouteData {
  Layout?: LayoutComponent,
  path: string,
  page: JSX.Element,
  exact?: boolean
}

export type LayoutComponent = ComponentType<{ page: JSX.Element }>

interface PageProps {
  routes: RouteData[]
}

/**
 * PageRouter abstracts away logic surrounding react-router, and provides an easy way
 * to specify a {@link LayoutComponent} for a page.
 */
export default function PageRouter({ routes }: PageProps) {
  const pages = routes.map(routeData => {
    const { Layout, path, page, exact } = routeData;
    if (Layout) {
      return (
        <Route key={path} path={path} exact={exact}>
          <Layout page={page}/>
        </Route>
      );
    }
    return <Route key={path} path={path} exact={exact}>{page}</Route>;
  });

  return (
    <Router>
      <Switch>
        {pages}
      </Switch>
    </Router>
  );
}
