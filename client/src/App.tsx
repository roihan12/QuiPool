import React from "react";

import "./index.css";

import Pages from "./Pages";
import { devtools } from "valtio/utils";
import { state } from "./state";

devtools(state, "app state");
const App: React.FC = () => <Pages />;

export default App;
