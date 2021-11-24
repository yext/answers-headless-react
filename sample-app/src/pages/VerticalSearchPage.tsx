import ResultsCount from '../components/ResultsCount';
import AlternativeVerticals from '../components/AlternativeVerticals';
import DecoratedAppliedFilters from '../components/DecoratedAppliedFilters';
import DirectAnswer from '../components/DirectAnswer';
import StaticFilters from '../components/StaticFilters';
import VerticalResults from '../components/VerticalResults';
import SpellCheck from '../components/SpellCheck';
import LocationBias from '../components/LocationBias';
import Facets from '../components/Facets';
import '../sass/VerticalSearchPage.scss';
import { StandardCard } from '../components/cards/StandardCard';
import { useLayoutEffect } from 'react';
import { useAnswersActions } from '@yext/answers-headless-react';
import { SearchIntent } from '@yext/answers-headless';
import {
  executeSearch,
  getSearchIntents,
  updateLocationIfNeeded
} from '../utils/search-operations';

const countryFilterOptions = [
  {
    label: 'canada',
    fieldId: 'c_employeeCountry',
    value: 'Canada',
  },
  {
    label: 'remote',
    fieldId: 'c_employeeCountry',
    value: 'Remote'
  },
  {
    label: 'usa',
    fieldId: 'c_employeeCountry',
    value: 'United States',
  }
]

const employeeFilterOptions = [
  {
    label: 'tech',
    fieldId: 'c_employeeDepartment',
    value: 'Technology'
  },
  {
    label: 'consult',
    fieldId: 'c_employeeDepartment',
    value: 'Consulting',
  },
  {
    label: 'fin',
    fieldId: 'c_employeeDepartment',
    value: 'Finance',
  }
]

const facetConfigs = {
  c_employeeDepartment: {
    label: 'Employee Department!'
  }
}

const staticFiltersGroupLabels = {
  c_employeeCountry: 'Employee Country',
  c_employeeDepartment: 'Employee Deparment'
}

export default function VerticalSearchPage(props: {
  verticalKey: string
}) {
  const answersActions = useAnswersActions();
  useLayoutEffect(() => {
    answersActions.setState({
      ...answersActions.state,
      universal: {}
    });
    answersActions.setVerticalKey(props.verticalKey);
    const executeQuery = async () => {
      let searchIntents: SearchIntent[] = [];
      if (!answersActions.state.location.userLocation) {
        searchIntents = await getSearchIntents(answersActions, true) || [];
        await updateLocationIfNeeded(answersActions, searchIntents);
      }
      executeSearch(answersActions, true);
    };
    executeQuery();
  }, [answersActions, props.verticalKey]);

  return (
    <div className='VerticalSearchPage'>
      <div className='start'>
        <StaticFilters
          title='~Country~'
          options={countryFilterOptions}
        />
        <StaticFilters
          title='~Employee Departments~'
          options={employeeFilterOptions}
        />
        <Facets
          searchOnChange={true}
          searchable={true}
          collapsible={true}
          defaultExpanded={true}
          facetConfigs={facetConfigs}
        />
        <SpellCheck
          isVertical={true}
        />
      </div>
      <div className='end'>
        <DirectAnswer />
        <ResultsCount />
        <DecoratedAppliedFilters
          showFieldNames={true}
          hiddenFields={['builtin.entityType']}
          delimiter='|'
          staticFiltersGroupLabels={staticFiltersGroupLabels}
        />
        <AlternativeVerticals
          currentVerticalLabel='People'
          verticalsConfig={[
            { label: 'Locations', verticalKey: 'KM' },
            { label: 'FAQs', verticalKey: 'faq' }
          ]}
        />
        <VerticalResults
          CardComponent={StandardCard}
          cardConfig={{ showOrdinal: true }}
          displayAllResults={true}
        />
        <LocationBias isVertical={false} />
      </div>
    </div>
  )
}