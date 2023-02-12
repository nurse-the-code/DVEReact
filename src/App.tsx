import { useEffect } from "react";
import BJSCanvas from "./Babylon/BJSCanvas";

import { $INIT_DVER, $INIT_RENDER } from "./contexts/Render/render";

function App() {
  useEffect(() => {
    (async () => {
      await $INIT_DVER();
      await $INIT_RENDER();
    })();
  });
  return <BJSCanvas />;
}

export default App;
