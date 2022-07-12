# Search Headless React

Search Headless React is the official React UI Bindings layer for [Search Headless](https://www.npmjs.com/package/@yext/answers-headless).

Written in 100% TypeScript.

<div>
  <a href="https://npmjs.org/package/@yext/search-headless-react">
    <img src="https://img.shields.io/npm/v/@yext/search-headless-react" alt="NPM version"/>
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-BSD%203--Clause-blue.svg" alt="License"/>
  </a>
  <a href='https://coveralls.io/github/yext/search-headless-react?branch=main'>
    <img src='https://coveralls.io/repos/github/yext/search-headless-react/badge.svg?branch=main' alt='Coverage Status' />
  </a>
</div>
<br>

## Installation

```shell
npm install @yext/search-headless-react
```

## Getting Started - `SearchHeadlessProvider`

Search Headless React includes an `<SearchHeadlessProvider />` component, which instantiates an AnswersHeadless instance and makes it available to the rest of your app.

```tsx
import { SearchHeadlessProvider } from '@yext/search-headless-react';
import SearchBar from './SearchBar';
import MostRecentSearch from './MostRecentSearch';
import UniversalResults from './UniversalResults';

function MyApp() {
  return (
    <SearchHeadlessProvider
      apiKey='your api key'
      experienceKey='your experience key'
      locale='en'
    >
      {/* Add components that use Answers as children */}
      <SearchBar/>
      <MostRecentSearch/>
      <UniversalResults/>
    </SearchHeadlessProvider>
  );
}
```

## Respond to State Updates with `useSearchState`

`useSearchState` reads a value from the `AnswersHeadless` state and subscribes to updates.

```tsx
import { useSearchState } from '@yext/search-headless-react';

 default function MostRecentSearch() {
  const mostRecentSearch = useSearchState(state => state.query.mostRecentSearch);
  return <div>Showing results for {mostRecentSearch}</div>;
}
```

## Dispatch Actions with `useSearchActions`

`useSearchActions` allows you to dispatch actions using the `AnswersHeadless` instance.

These include performing searches, getting autocomplete suggestions, and adding filters.

For a full list of capabilities see [the answers-headless docs](https://www.npmjs.com/package/@yext/answers-headless).

```tsx
import { useSearchActions } from '@yext/search-headless-react';
import { ChangeEvent, KeyboardEvent, useCallback } from 'react';

function SearchBar() {
  const search = useSearchActions();
  const handleTyping = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    search.setQuery(e.target.value);
  }, [search]);
  
  const handleKeyDown = useCallback((evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter' ) {
      search.executeUniversalQuery();
    }
  }, [search]);

  return <input onChange={handleTyping} onKeyDown={handleKeyDown}/>;
}
```

## `AnswersHeadlessContext`
### Class Components

For users that want to use class components instead of functional components, you can use the `AnswersHeadlessContext` directly to dispatch actions and receive updates from state.

As an example, here is our simple SearchBar again, rewritten as a class using `AnswersHeadlessContext`.

```tsx
import { AnswersHeadlessContext, AnswersHeadless, State } from '@yext/answers-headless-react';
import { Component } from 'react';

export default class Searcher extends Component {
  static contextType = AnswersHeadlessContext;
  unsubscribeQueryListener: any;
  state = { query: "" };

  componentDidMount() {
    const answers: AnswersHeadless = this.context;
    this.unsubscribeQueryListener = answers.addListener({
      valueAccessor: (state: State) => state.query.mostRecentSearch,
      callback: newPropsFromState => {
        this.setState({ query: newPropsFromState })
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribeQueryListener();
  }

  render() {
    const answers: AnswersHeadless = this.context;
    return (
      <div>
        <p>Query: {this.state.query}</p>
        <input
          onChange={evt => answers.setQuery(evt.target.value)}
          onKeyDown={evt => {
            if (evt.key === 'Enter') {
              answers.executeUniversalQuery();
            }
          }}
        />
      </div>
    )
  }
}
```

## `useSearchUtilities`

We offer a `useSearchUtilities` convenience hook for accessing `AnswersHeadless.utilities`, which offers a number of stateless utility methods.
The `searchUtilities` and `searchUtilitiesFromActions` variables below are equivalent.

For class components, you can access `SearchUtilities` through `SearchHeadlessContext`.

```ts
const searchUtilities = useSearchUtilities();
const searchUtilitiesFromActions = useSearchActions().utilities;
```
