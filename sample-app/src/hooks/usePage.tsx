import { SearchIntent } from "@yext/answers-headless";
import { useLayoutEffect } from "react";
import { useAnswersActions } from "@yext/answers-headless-react";
import { executeSearch, getSearchIntents, updateLocationIfNeeded } from "../utils/search-operations";

export default function usePage(verticalKey?: string) {
  const answersActions = useAnswersActions();
  useLayoutEffect(() => {
    const stateToClear = verticalKey
      ? { universal: {} }
      : { vertical: {} };
    answersActions.setState({
      ...answersActions.state,
      ...stateToClear
    });
    verticalKey
      ? answersActions.setVerticalKey(verticalKey)
      : answersActions.setVerticalKey('');
    const executeQuery = async () => {
      let searchIntents: SearchIntent[] = [];
      if (!answersActions.state.location.userLocation) {
        searchIntents = await getSearchIntents(answersActions, !!verticalKey) || [];
        await updateLocationIfNeeded(answersActions, searchIntents);
      }
      executeSearch(answersActions, !!verticalKey);
    };
    executeQuery();
  }, [answersActions, verticalKey]);
}