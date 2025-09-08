import { Transport, TransportEvent, ViewState } from 'next-box';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import nextboxLogo from '@shared/assets/nextbox.svg';
import reactLogo from '@shared/assets/react.svg';
import viteLogo from '@shared/assets/vite.svg';
import {
  AUTOSAVE_INTERVAL,
  IConnection,
  notifications,
  useNextbox,
} from '@shared/integrations/nextbox';

import './App.css';

function App() {
  const nextbox = useNextbox();
  const [count, setCount] = useState(0);
  const [connectionsList, setConnectionsList] = useState<IConnection[] | null>(
    null,
  );
  const [interactionMode, setInteractionMode] = useState<ViewState>(
    nextbox.api.state?.view,
  );
  const [showConnectionsList, setShowConnectionsList] =
    useState<boolean>(false);
  const [selectedStorageElement, setSelectedStorageElement] = useState<
    string | null
  >(null);

  useLayoutEffect(() => {
    if (nextbox) {
      const fullPath = nextbox.api.state.storage.path;
      nextbox
        .readNode(fullPath, {})
        .then((data) => {
          setCount(Number(data));
        })
        .catch((error) => {
          Transport.toast({
            // Shows toast if error occured
            ...notifications.NEXTBOX_API_DOWNLOAD_ERROR,
            message: error.message,
          });
        });

      nextbox
        .getConnections()
        .then((data) => setConnectionsList(data))
        .catch((error) => {
          Transport.toast({
            ...notifications.API_GET_CONNECTIONS_ERROR,
            message: error.message,
          });
        });
    }
  }, [nextbox]);

  // App's view/edit mode change here
  const handleInteractionMode = useCallback(({ view }: { view: ViewState }) => {
    setInteractionMode(view);
  }, []);

  // Save logic here
  const handleSave = useCallback(() => {
    const fullPath = nextbox.api.state.storage.path;
    console.log('COUNT INSE HANDLE SAVE IS: ', count);
    nextbox
      .updateNode({ fullPath, data: count }, {})
      .then((res) => {
        Transport.changeContent(false);
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [nextbox, count]);

  // Delete code below if u don't need autosave functionality
  // and remove autoSave() calls on each content change.
  const autoSave = () => {
    const now = new Date().getTime();
    const lastSave = localStorage.getItem('timestamp') || 0;
    const intervalIsPassed = now - Number(lastSave) >= AUTOSAVE_INTERVAL;
    if (intervalIsPassed) {
      localStorage.setItem('timestamp', new Date().getTime().toString());
      handleSave();
    }
  };

  // Here you get info from nextbox storage element selection modal
  const handleSelectStorageElement = useCallback(
    async ({ paths }: { paths: string[] }) => {
      if (paths) {
        setSelectedStorageElement(paths[0]);
      }
    },
    [],
  );

  // Subscription to nextbox events
  useEffect(() => {
    Transport.on(TransportEvent.AppChangeState, handleInteractionMode);
    Transport.on(TransportEvent.AppSaveAndClose, handleSave);
    Transport.on(TransportEvent.AppFilesSelected, handleSelectStorageElement);

    return () => {
      Transport.off(TransportEvent.AppChangeState, handleInteractionMode);
      Transport.off(TransportEvent.AppSaveAndClose, handleSave);
      Transport.off(
        TransportEvent.AppFilesSelected,
        handleSelectStorageElement,
      );
    };
  }, [handleInteractionMode, handleSave, handleSelectStorageElement]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://next-box.ru" target="_blank">
          <img src={nextboxLogo} className="logo" alt="Nextbox logo" />
        </a>
      </div>
      <h1>Vite + React + Nextbox</h1>
      <div className="card">
        <p>Nextbox app state now is - {interactionMode}</p>
        <span className="button-group">
          <button
            disabled={interactionMode === ViewState.view}
            onClick={() => {
              Transport.changeContent(true); // enables save button in nextbox toolbar to let user manually save data
              setCount((count) => count + 1);
              autoSave(); // Remove this line if u don't need autosave
            }}
          >
            count is {count}
          </button>
          <button onClick={() => setShowConnectionsList(!showConnectionsList)}>
            show connections list
          </button>
          <button
            className={selectedStorageElement ? 'element-selected' : ''}
            onClick={() =>
              Transport.openModalFilesSelect({
                // opens nextbox modal for storage element selection
                multy: false,
              })
            }
          >
            {selectedStorageElement
              ? `selected path is: ${selectedStorageElement}`
              : 'show nextbox modal'}
          </button>
        </span>
        {showConnectionsList && (
          <ul className="connections-list">
            {connectionsList?.map((connection) => (
              <li>{connection.name}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;
