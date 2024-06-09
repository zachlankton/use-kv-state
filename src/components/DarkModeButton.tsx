import { connect } from "react-redux";
import { toggleDarkMode } from "../redux-stuff/darkModeActions";

const DarkModeToggle = ({ isDarkMode, toggleDarkMode }: any) => {
  return (
    <button onClick={toggleDarkMode}>
      {isDarkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
};

const mapStateToProps = (state: any) => {
  return {
    isDarkMode: state.darkMode.isDarkMode,
  };
};

const mapDispatchToProps = {
  toggleDarkMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(DarkModeToggle);
