import './sass/App.scss';
import VerticalSearchPage from './pages/VerticalSearchPage';
import UniversalSearchPage from './pages/UniversalSearchPage';
import PageRouter from './PageRouter';
import StandardLayout from './pages/StandardLayout';
import { AnswersHeadlessProvider } from '@yext/answers-headless-react';
import { universalResultsConfig } from './universalResultsConfig';
import GuidedSearchPage from './pages/GuidedSearchPage';

const routes = [
  {
    Layout: StandardLayout,
    path: '/',
    exact: true,
    page: <UniversalSearchPage universalResultsConfig={universalResultsConfig} />
  },
  {
    path: '/prompt',
    page: <GuidedSearchPage verticalKey='people' />
  },
  ...Object.keys(universalResultsConfig).map(key => {
    return {
      Layout: StandardLayout,
      path: `/${key}`,
      page: <VerticalSearchPage verticalKey={key} />
    }
  })
];

export default function App() {
  return (
    <AnswersHeadlessProvider
      apiKey='2d8c550071a64ea23e263118a2b0680b'
      experienceKey='slanswers'
      locale='en'
      verticalKey='people'
    >
      <div className='App'>
        <PageRouter
          routes={routes}
        />
      </div>
    </AnswersHeadlessProvider>
  );
}
