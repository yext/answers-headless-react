/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType, useReducer, useEffect, useContext } from 'react';
import { State } from '@yext/answers-headless';
import { SearchHeadlessContext } from './SearchHeadlessContext';
import isShallowEqual from './utils/isShallowEqual';

type SubscriberGenerator = (WrappedComponent: ComponentType<any>) => (props: any) => JSX.Element;

/**
 * Generates a HOC that updates a given Component's props based on the current
 * answers-headless state and a given mapping function.
 *
 * @deprecated
 * For class component, use `AnswersHeadlessContext` directly to dispatch actions and receive state updates.
 * For functional component, use `useAnswersActions` and `useAnswersState` instead.
 */
export function subscribeToStateUpdates(
  mapStateToProps: (s: State) => Record<string, unknown>
): SubscriberGenerator {
  const generateSubscriberHOC: SubscriberGenerator = WrappedComponent => {
    /**
     * Keep manual track of the props mapped from state instead of storing
     * it in the AnswersHeadlessSubscriber's state. This avoids react's batching
     * of state updates, which can result in mappedState not updating immediately.
     * This can, in turn, result in extra answers-headless listener invocations.
     */
    let previousPropsFromState = {};
    return function AnswersHeadlessSubscriber(props: Record<string, unknown>) {
      const answers = useContext(SearchHeadlessContext);
      const [mergedProps, dispatch] = useReducer(() => {
        return {
          ...props,
          ...previousPropsFromState
        };
      }, { ...props, ...mapStateToProps(answers.state) });

      useEffect(() => {
        return answers.addListener({
          valueAccessor: (state: State) => mapStateToProps(state),
          callback: newPropsFromState => {
            if (!isShallowEqual(previousPropsFromState, newPropsFromState)) {
              previousPropsFromState = newPropsFromState;
              dispatch();
            }
          }
        });
      });
      return <WrappedComponent {...mergedProps}/>;
    };
  };
  return generateSubscriberHOC;
}
