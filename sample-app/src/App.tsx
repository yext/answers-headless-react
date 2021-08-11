import './sass/App.scss';
import { AnswersActionsProvider } from '@yext/answers-headless-react';
import StaticFilters from './components/StaticFilters';
import ResultsCount from './components/ResultsCount';
import VerticalResults from './components/VerticalResults';
import VerticalSearchForm from './components/VerticalSearchForm';
import SpellCheck from './components/SpellCheck';
import { StandardCard } from './components/cards/StandardCard';

function App() {
  const staticFilterOptions = [
    {
      field: 'c_employeeDepartment',
      value: 'Technology'
    },
    {
      field: 'c_employeeDepartment',
      value: 'Consulting',
    },
    {
      field: 'c_employeeDepartment',
      value: 'Finance',
    }
  ]
  function createSpellCheckLink (correctedQuery: string = '') : string {
    return `./?query=${correctedQuery}`;
  }
  return (
    <AnswersActionsProvider
      apiKey='2d8c550071a64ea23e263118a2b0680b'
      experienceKey='slanswers'
      locale='en'
    >
      <div className='left'>
        test
        <StaticFilters
          title='~Employee Departments~'
          options={staticFilterOptions}
        />
        <SpellCheck
          createLink={createSpellCheckLink}
        />
      </div>
      <div className='right'>
        <VerticalSearchForm verticalKey='people' />
        <ResultsCount />
        <VerticalResults 
          CardComponent={StandardCard}
          cardConfig={{ showOrdinal: true }}
        />
      </div>
    </AnswersActionsProvider>
  );
}

export default App;
