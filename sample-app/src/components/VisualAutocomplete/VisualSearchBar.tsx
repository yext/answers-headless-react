import { useAnswersActions, useAnswersState, VerticalResults, AutocompleteResult } from '@yext/answers-headless-react';
import { PropsWithChildren, useEffect } from 'react';
import InputDropdown from '../InputDropdown';
import '../../sass/Autocomplete.scss';
import DropdownSection, { Option } from '../DropdownSection';
import { useEntityPreviews } from '../../hooks/useEntityPreviews';
import SearchButton from '../SearchButton';
import { processTranslation } from '../utils/processTranslation';
import { useSynchronizedRequest } from '../../hooks/useSynchronizedRequest';
import { calculateRestrictVerticals, calculateUniversalLimit, transformEntityPreviews } from './EntityPreviews';
import useSearchWithNearMeHandling from '../../hooks/useSearchWithNearMeHandling';
import { builtInCssClasses as builtInSearchBarCssClasses, SearchBarCssClasses } from '../SearchBar';
import { CompositionMethod, useComposedCssClasses } from '../../hooks/useComposedCssClasses';
import { ReactComponent as YextLogoIcon } from '../../icons/yext_logo.svg';
import renderAutocompleteResult from '../utils/renderAutocompleteResult';
import { ReactComponent as RecentSearchIcon } from '../../icons/history.svg';
import useRecentSearches from '../../hooks/useRecentSearches';
import classNames from 'classnames';

const SCREENREADER_INSTRUCTIONS = 'When autocomplete results are available, use up and down arrows to review and enter to select.'
const builtInCssClasses: VisualSearchBarCssClasses = { 
  ...builtInSearchBarCssClasses, 
  recentSearchesOption: 'flex items-center py-1 px-2 cursor-pointer',
  recentSearchesLogoContainer: 'w-4',
  recentSearchesOptionValue: 'ml-2'
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
  hideVerticalLinks?: boolean,
  verticalKeyToNameMapping?: Record<string, string>,
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
  hideVerticalLinks,
  verticalKeyToNameMapping,
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
      /**
       * TODO (yen-tt): mocked data is used for testing purposes.
       * Should be replace with result.verticalKeys when backend work is done.
       */
      const verticalKeys = hideVerticalLinks ? undefined : ['people', 'financial_professionals'];
      const verticalLinks = verticalKeyToNameMapping && verticalKeys?.map(verticalKey => { 
        return {
          label: verticalKeyToNameMapping[verticalKey],
          verticalKey
        }
      });
      return {
        value: result.value,
        verticalLinks,
        render: (onClick: () => void, isOptionFocus: boolean, focusLinkIndex: number) => 
          renderAutocompleteResult(
            result,
            onClick,
            cssClasses,
            isOptionFocus,
            verticalLinks,
            focusLinkIndex
          )
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
    const options: Option[] = recentSearches?.map(result => {
      return {
        value: result.query,
        render: (onClick, isOptionFocus) => {
          const OptionCssClasses = cssClasses.focusedOption
            ? classNames(cssClasses.recentSearchesOption, { [cssClasses.focusedOption]: isOptionFocus })
            : cssClasses.recentSearchesOption;
          return (<div onClick={onClick} className={OptionCssClasses}>
            <div className={cssClasses.recentSearchesLogoContainer}><RecentSearchIcon /></div>
            <div className={cssClasses.recentSearchesOptionValue}>{result.query}</div>
          </div>)
        }
      }
    }) ?? [];
    if (options.length === 0) {
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
      <div className={cssClasses.inputDropdownContainer}>
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