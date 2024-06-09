import { connect } from "react-redux";

const _DarkModeDisplay = ({ isDarkMode }: any) => {
  return <p>{isDarkMode ? "Light Mode" : "Dark Mode"}</p>;
};

const mapStateToProps = (state: any) => {
  return {
    isDarkMode: state.darkMode.isDarkMode,
  };
};

export const DarkModeDisplay = connect(mapStateToProps)(_DarkModeDisplay);
