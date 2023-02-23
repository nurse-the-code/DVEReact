import { useEffect } from "react";
import BJSCanvas from "./Babylon/BJSCanvas";

import { $INIT_DVER } from "./contexts/Render/render";

function App() {
  useEffect(() => {
    (async () => {
      await $INIT_DVER();
 
    })();
  });
  return <BJSCanvas />;
}

export default App;
