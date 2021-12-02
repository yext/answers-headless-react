import { CardComponent, CardConfigTypes } from '../models/cardComponent';
import { useAnswersState, Result } from '@yext/answers-headless-react';
import classNames from 'classnames';

interface VerticalResultsDisplayProps {
  CardComponent: CardComponent,
  cardConfig?: CardConfigTypes,
  isLoading?: boolean,
  results: Result[]
}

/**
 * A Component that displays all the search results for a given vertical.
 * 
 * @param props - The props for the Component, including the results and the card type
 *                to be used.
 */
export function VerticalResultsDisplay(props: VerticalResultsDisplayProps): JSX.Element | null {
  const { CardComponent, results, cardConfig = {}, isLoading = false } = props;

  if (results.length === 0) {
    return null;
  }

  const resultsClassNames = classNames('VerticalResults', { 'VerticalResults--loading': isLoading });

  return (
    <div className={resultsClassNames}>
      {results && results.map(result => renderResult(CardComponent, cardConfig, result))}
    </div>
  )
}

/**
 * Renders a single result using the specified card type and configuration.
 * 
 * @param CardComponent - The card for the vertical.
 * @param cardConfig - Any card-specific configuration.
 * @param result - The result to render.
 */
function renderResult(CardComponent: CardComponent, cardConfig: CardConfigTypes, result: Result): JSX.Element {
  return <CardComponent result={result} configuration={cardConfig} key={result.id || result.index}/>;
}

interface VerticalResultsProps {
  CardComponent: CardComponent,
  cardConfig?: CardConfigTypes,
  displayAllResults?: boolean
}

export default function VerticalResults(props: VerticalResultsProps): JSX.Element | null {
  const { displayAllResults = true, ...otherProps } = props;

  const verticalResults = useAnswersState(state => state.vertical.results) || [];
  const allResultsForVertical = useAnswersState(state => state.vertical?.noResults?.allResultsForVertical.results) || [];
  const isLoading = useAnswersState(state => state.searchStatus.isLoading);

  const results = verticalResults.length === 0 && displayAllResults
    ? allResultsForVertical
    : verticalResults

  return <VerticalResultsDisplay results={results} isLoading={isLoading} {...otherProps}/>
}