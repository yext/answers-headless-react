import { useAnswersActions, useAnswersState, VerticalResults, AutocompleteResult } from '@yext/answers-headless-react';
import { PropsWithChildren, useEffect } from 'react';
import InputDropdown from '../InputDropdown';
import '../../sass/Autocomplete.scss';
import DropdownSection from '../DropdownSection';
import { useEntityPreviews } from '../../hooks/useEntityPreviews';
import SearchButton from '../SearchButton';
import { processTranslation } from '../utils/processTranslation';
import { useSynchronizedRequest } from '../../hooks/useSynchronizedRequest';
import { calculateRestrictVerticals, calculateUniversalLimit, transformEntityPreviews } from './EntityPreviews';
import useSearchWithNearMeHandling from '../../hooks/useSearchWithNearMeHandling';
import { builtInCssClasses as builtInSearchBarCssClasses, SearchBarCssClasses } from '../SearchBar';
import { CompositionMethod, useComposedCssClasses } from '../../hooks/useComposedCssClasses';
import { ReactComponent as YextLogoIcon } from '../../icons/yext_logo.svg';
import { ReactComponent as RecentSearchIcon } from '../../icons/history.svg';
import renderAutocompleteResult from '../utils/renderAutocompleteResult';
import useRecentSearches from '../../hooks/useRecentSearches';

const SCREENREADER_INSTRUCTIONS = 'When autocomplete results are available, use up and down arrows to review and enter to select.'
const builtInCssClasses: VisualSearchBarCssClasses = { 
  ...builtInSearchBarCssClasses, 
  recentSearchesOption: 'flex items-center py-1 px-2 cursor-pointer',
  recentSearchesLogoContainer: 'w-4 mr-5'
};

interface VisualSearchBarCssClasses extends SearchBarCssClasses {
  recentSearchesOption?: string,
  recentSearchesLogoContainer?: string,
  recentSearchesOptionValue?: string
}

type RenderEntityPreviews = (
  autocompleteLoading: boolean,
  verticalResultsArray: VerticalResults[]
) => JSX.Element;

interface Props {
  placeholder?: string,
  geolocationOptions?: PositionOptions,
  screenReaderInstructionsId: string,
  headlessId: string,
  // The debouncing time, in milliseconds, for making API requests for entity previews
  entityPreviewsDebouncingTime: number,
  renderEntityPreviews?: RenderEntityPreviews,
  hideRecentSearches?: boolean,
  recentSearchesLimit?: number,
  customCssClasses?: VisualSearchBarCssClasses,
  cssCompositionMethod?: CompositionMethod
}

/**
 * Renders a SearchBar with visual autocomplete.
 */
export default function VisualSearchBar({
  placeholder,
  screenReaderInstructionsId,
  headlessId,
  hideRecentSearches,
  renderEntityPreviews,
  recentSearchesLimit = 5,
  customCssClasses,
  cssCompositionMethod,
  entityPreviewsDebouncingTime = 500
}: PropsWithChildren<Props>) {
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses, cssCompositionMethod);

  const answersActions = useAnswersActions();
  const query = useAnswersState(state => state.query.input) ?? '';
  const isLoading = useAnswersState(state => state.searchStatus.isLoading) ?? false;
  const [executeQueryWithNearMeHandling, autocompletePromiseRef] = useSearchWithNearMeHandling(answersActions)
  const [autocompleteResponse, executeAutocomplete] = useSynchronizedRequest(async () => {
    return answersActions.executeUniversalAutocomplete();
  });
  const [
    recentSearches,
    setRecentSearch,
    clearRecentSearches
  ] = useRecentSearches(recentSearchesLimit);
  useEffect(() => {
    if (hideRecentSearches) {
      clearRecentSearches();
    }
  }, [clearRecentSearches, hideRecentSearches])
  const haveRecentSearches = !hideRecentSearches && recentSearches?.length !== 0;
  

  function executeQuery() {
    if (!hideRecentSearches) {
      const input = answersActions.state.query.input;
      input && setRecentSearch(input);
    }
    executeQueryWithNearMeHandling();
  }

  const [entityPreviewsState, executeEntityPreviewsQuery] = useEntityPreviews(headlessId, entityPreviewsDebouncingTime);
  const { verticalResultsArray, isLoading: entityPreviewsLoading } = entityPreviewsState;
  const autocompleteResults = autocompleteResponse?.results || [];
  const entityPreviews = renderEntityPreviews && renderEntityPreviews(entityPreviewsLoading, verticalResultsArray);
  function updateEntityPreviews(query: string) {
    if (!renderEntityPreviews) {
      return;
    }
    const restrictVerticals = calculateRestrictVerticals(entityPreviews);
    const universalLimit = calculateUniversalLimit(entityPreviews);
    executeEntityPreviewsQuery(query, universalLimit, restrictVerticals);
  }

  function renderQuerySuggestions() {
    if (autocompleteResults.length === 0) {
      return null;
    }
    const options = autocompleteResults.map(result => {
      return {
        value: result.value,
        display: renderAutocompleteResult(result, cssClasses.resultIconContainer)
      }
    }) ?? [];

    return <DropdownSection
      options={options}
      optionIdPrefix='VisualSearchBar-QuerySuggestions'
      onFocusChange={value => {
        answersActions.setQuery(value);
        updateEntityPreviews(value);
      }}
      onSelectOption={optionValue => {
        autocompletePromiseRef.current = undefined;
        answersActions.setQuery(optionValue);
        executeQuery();
      }}
      cssClasses={cssClasses}
    />
  }

  function renderRecentSearches() {
    const options = recentSearches?.map(result => {
      return {
        value: result.query,
        display: (
          <div className={cssClasses.recentSearchesOption}>
            <div className={cssClasses.recentSearchesLogoContainer}><RecentSearchIcon /></div>
            <div className={cssClasses.recentSearchesOptionValue}>{result.query}</div>
          </div>
        )
      }
    });
    if (!options) {
      return null;
    }

    return <DropdownSection
      options={options}
      optionIdPrefix='VisualSearchBar-RecentSearches'
      onSelectOption={optionValue => {
        autocompletePromiseRef.current = undefined;
        answersActions.setQuery(optionValue);
        executeQuery();
      }}
      cssClasses={cssClasses}
    />
  }

  return (
    <div className={cssClasses.container}>
      <InputDropdown
        inputValue={query}
        placeholder={placeholder}
        screenReaderInstructions={SCREENREADER_INSTRUCTIONS}
        screenReaderInstructionsId={screenReaderInstructionsId}
        screenReaderText={getScreenReaderText(autocompleteResults)}
        onSubmit={executeQuery}
        onInputChange={value => {
          answersActions.setQuery(value);
        }}
        onInputFocus={value => {
          updateEntityPreviews(value);
          autocompletePromiseRef.current = executeAutocomplete();
        }}
        renderSearchButton={() =>
          <SearchButton
            className={cssClasses.submitButton}
            handleClick={executeQuery}
            isLoading={isLoading}
          />
        }
        renderLogo={() => <YextLogoIcon />}
        cssClasses={cssClasses}
        forceHideDropdown={autocompleteResults.length === 0 && verticalResultsArray.length === 0 && !haveRecentSearches}
      >
        {!hideRecentSearches && renderRecentSearches()}
        {renderQuerySuggestions()}
        {entityPreviews && transformEntityPreviews(entityPreviews, verticalResultsArray)}
      </InputDropdown>
    </div>
  )
}

function getScreenReaderText(options: AutocompleteResult[]) {
  return processTranslation({
    phrase: `${options.length} autocomplete option found.`,
    pluralForm: `${options.length} autocomplete options found.`,
    count: options.length
  });
}