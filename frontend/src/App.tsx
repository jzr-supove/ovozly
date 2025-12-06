/**
 * Ovozly Frontend - Root Application Component
 *
 * Entry point component that initializes routing.
 */

import { FC } from "react";
import AppRoutes from "./router/AppRoutes";

const App: FC = () => {
  return <AppRoutes />;
};

export default App;
