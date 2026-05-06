import React, { useState } from 'react';
import { Panel, PanelHeader, FormLayout, Input, Button, Div, Select, Textarea, Spinner, FormStatus } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';

const modes = [
  { id: 'ads', label: '📢 Реклама' },
  { id: 'post', label: '📝 Пост' },
  { id: 'sales', label: '💰 Продажи' },
  { id: 'idea', label: '💡 Идеи' },
  { id: 'motivation', label: '⚡ Мотивация' },
  { id: 'scripts', label: '🎬 Сценарии' },
  { id: 'chat', label: '💬 Ответы' },
  { id: 'viral', label: '🔥 Вирус' },
  { id: 'business', label: '🏢 Бизнес' }
];

// ЗАМЕНИТЕ НА ВАШ URL (например, https://ваш-проект.vercel.app/api/generate)
const API_URL = 'https://ваш-проект.vercel.app/api/generate';

export const Home = ({ id }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('post');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!prompt.trim()) {
      setError('Введите тему (минимум 3 символа)');
      return;
    }
    setError('');
    setLoading(true);
    setGenerated('⏳ Генерация... Это может занять до 10 секунд.');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), mode })
      });
      const data = await response.json();
      if (response.ok && data.text) {
        setGenerated(data.text);
        await bridge.send('VKWebAppShowNotification', { text: 'Текст готов!' });
      } else {
        setGenerated('❌ Ошибка: ' + (data.error || 'неизвестная ошибка'));
      }
    } catch (err) {
      console.error(err);
      setGenerated('❌ Не удалось соединиться с сервером. Проверьте бэкенд.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (generated && !generated.includes('Генерация') && !generated.includes('Ошибка')) {
      navigator.clipboard.writeText(generated);
      await bridge.send('VKWebAppShowNotification', { text: 'Текст скопирован' });
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader>AI Контент Студия</PanelHeader>
      <Div>
        <FormLayout>
          <Select
            top="Режим"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {modes.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </Select>
          <Input
            top="Тема / запрос"
            placeholder="Например: продажа дома, фитнес для начинающих"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button size="l" stretched onClick={generate} disabled={loading}>
            {loading ? <Spinner size="small" /> : '✨ Сгенерировать'}
          </Button>
          {error && <FormStatus mode="error">{error}</FormStatus>}
          {generated && (
            <>
              <Textarea
                top="Результат"
                value={generated}
                rows={12}
                readOnly
              />
              <Button size="l" stretched mode="secondary" onClick={copyText}>
                📋 Копировать текст
              </Button>
            </>
          )}
        </FormLayout>
      </Div>
    </Panel>
  );
};