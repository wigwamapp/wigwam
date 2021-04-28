import BaseProvider from "./BaseProvider";
import PageRouter from "./PageRouter";

const App: React.FC = () => (
  <BaseProvider>
    <PageRouter />
  </BaseProvider>
);

export default App;
