import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import { Home } from './panels/Home';
import '@vkontakte/vkui/dist/vkui.css';

function App() {
  const [activePanel, setActivePanel] = useState('home');
  const [fetchedUser, setFetchedUser] = useState(null);
  const [popout, setPopout] = useState(null);

  useEffect(() => {
    async function init() {
      setPopout(<ScreenSpinner />);
      try {
        await bridge.send('VKWebAppInit');
        const user = await bridge.send('VKWebAppGetUserInfo');
        setFetchedUser(user);
      } catch (e) {
        console.error(e);
      } finally {
        setPopout(null);
      }
    }
    init();
  }, []);

  return (
    <AdaptivityProvider>
      <AppRoot>
        <View activePanel={activePanel} popout={popout}>
          <Home id="home" />
        </View>
      </AppRoot>
    </AdaptivityProvider>
  );
}

export default App;