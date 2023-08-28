// this component is not currently being used
import React from 'react';
import Autosuggest from 'react-autosuggest';

// Hard-coded list of suggestions
const lineages = [
  'Lineage 1',
  'Lineage 2',
  // ...add all your lineages here
];

const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : lineages.filter(lineage =>
    lineage.toLowerCase().slice(0, inputLength) === inputValue
  );
};

class AutoComplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: []
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: this.props.placeholder,
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={suggestion => suggestion}
        renderSuggestion={suggestion => <div>{suggestion}</div>}
        inputProps={inputProps}
      />
    );
  }
}

export default AutoComplete;
