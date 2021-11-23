import React from "react";
import { useReducer, KeyboardEvent, useRef, useEffect, useState } from "react"
import Dropdown, { Option } from './Dropdown';
import ScreenReader from "./ScreenReader";
import { processTranslation } from './utils/processTranslation';
import { SectionProps } from './Section';

interface Props {
  inputValue?: string,
  placeholder?: string,
  screenReaderInstructions: string,
  screenReaderInstructionsId: string,
  optionIdPrefix: string,
  onSubmit?: (value: string) => void,
  onInputChange?: (value: string) => void,
  onInputClick?: () => void,
  updateInputValue: (value: string) => void,
  renderButtons?: () => JSX.Element | null,
  cssClasses: {
    optionContainer: string,
    option: string,
    focusedOption: string,
    inputElement: string,
    inputContainer: string
  }
}

interface State {
  focusedSectionIndex?: number,
  shouldDisplayDropdown: boolean
}

type Action =
  | { type: 'HideDropdown' }
  | { type: 'ShowDropdown' }
  | { type: 'FocusOption', newIndex?: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HideDropdown':
      return { focusedSectionIndex: undefined, shouldDisplayDropdown: false }
    case 'ShowDropdown':
      return { focusedSectionIndex: undefined, shouldDisplayDropdown: true }
    case 'FocusOption':
      return { focusedSectionIndex: action.newIndex, shouldDisplayDropdown: true }
  }
}

/**
 * A controlled input component with an attached dropdown.
 */
export default function InputDropdown({
  inputValue = '',
  placeholder,
  screenReaderInstructions,
  screenReaderInstructionsId,
  optionIdPrefix,
  children,
  onSubmit = () => {},
  updateInputValue,
  //updateDropdown,
  onInputChange = () => {},
  onInputClick = () => {},
  renderButtons = () => null,
  cssClasses
}: React.PropsWithChildren<Props>): JSX.Element | null {
  const [{
    focusedSectionIndex,
    shouldDisplayDropdown,
  }, dispatch] = useReducer(reducer, {
    focusedSectionIndex: undefined,
    shouldDisplayDropdown: false,
  });
  // const focusOptionId = focusedOptionIndex === undefined
  //   ? undefined
  //   : `${optionIdPrefix}-${focusedOptionIndex}`;

  const childrenArray = React.Children.toArray(children);
  const childrenWithProps = childrenArray.map((child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }
    const updatedProps: SectionProps = {}
    if (index === 1) {
      updatedProps['focusStatus'] = 'active';
      console.log('updateding props')
    }
    return React.cloneElement(child, updatedProps);
  });

  const [latestUserInput, setLatestUserInput] = useState(inputValue);
  const [screenReaderKey, setScreenReaderKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(document.createElement('input'));

  if (!shouldDisplayDropdown && screenReaderKey) {
    setScreenReaderKey(0);
  }

  function handleDocumentClick(evt: MouseEvent) {
    const target = evt.target as HTMLElement;
    if (!target.isSameNode(inputRef.current)) {
      dispatch({ type: 'HideDropdown' });
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick);
  });

  function onKeyDown(evt: KeyboardEvent<HTMLInputElement>) {
    // if (['ArrowDown', 'ArrowUp'].includes(evt.key)) {
    //   evt.preventDefault();
    // }

    // const isFirstOptionFocused = focusedOptionIndex === 0;
    // const isLastOptionFocused = focusedOptionIndex === options.length - 1;
    // if (evt.key === 'Enter') {
    //   updateInputValue(inputValue);
    //   onSubmit(inputValue);
    //   dispatch({ type: 'HideDropdown' });
    // } else if (evt.key === 'Escape' || evt.key === 'Tab') {
    //   dispatch({ type: 'HideDropdown' });
    // } else if (evt.key === 'ArrowDown' && options.length > 0 && !isLastOptionFocused) {
    //   const newIndex = focusedOptionIndex !== undefined ? focusedOptionIndex + 1 : 0;
    //   dispatch({ type: 'FocusOption', newIndex });
    //   const newValue = options[newIndex]?.value;
    //   updateInputValue(newValue);
    // } else if (evt.key === 'ArrowUp' && focusedOptionIndex !== undefined) {
    //   const newIndex = isFirstOptionFocused ? undefined : focusedOptionIndex - 1;
    //   dispatch({ type: 'FocusOption', newIndex });
    //   const newValue = newIndex !== undefined
    //     ? options[newIndex]?.value
    //     : latestUserInput;
    //   updateInputValue(newValue);
    // }
  }

  return (
    <>
      <div className={cssClasses.inputContainer}>
        <input
          className={cssClasses.inputElement}
          placeholder={placeholder}
          onChange={evt => {
            const value = evt.target.value;
            dispatch({ type: 'ShowDropdown' });
            setLatestUserInput(value);
            updateInputValue(value);
            onInputChange(value);
            setScreenReaderKey(screenReaderKey + 1);
          }}
          onClick={() => {
            onInputClick();
            dispatch({ type: 'ShowDropdown' });
            // if (options.length || inputValue) {
            //   setScreenReaderKey(screenReaderKey + 1);
            // }
          }}
          onKeyDown={onKeyDown}
          value={inputValue}
          ref={inputRef}
          aria-describedby={screenReaderInstructionsId}
          //aria-activedescendant={focusOptionId}
        />
        {renderButtons()}
      </div>
      {/* <ScreenReader
        instructionsId={screenReaderInstructionsId}
        instructions={screenReaderInstructions}
        announcementKey={screenReaderKey}
        announcementText={screenReaderKey ?
          processTranslation({
            phrase: `${options.length} autocomplete option found.`,
            pluralForm: `${options.length} autocomplete options found.`,
            count: options.length
          })
          : ''
        }
      /> */}
      {shouldDisplayDropdown &&
        childrenWithProps
        // <Dropdown
        //   optionIdPrefix={optionIdPrefix}
        //   onClickOption={option => {
        //     updateInputValue(option.value);
        //     onSubmit(option.value)
        //     dispatch({ type: 'HideDropdown' })
        //   }}
        //   focusedOptionIndex={focusedOptionIndex}
        //   cssClasses={cssClasses}
        // />
      }
    </>
  );
};