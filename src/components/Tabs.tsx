import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';

// Container for the whole tabs component
const TabsContainer = styled.div`
  margin-top: 2rem;
`;

// Row of tab buttons
const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid ${({ theme }) => theme.colors.surface};
`;

// Individual tab button
const TabButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${({ active, theme }) =>
    active ? theme.colors.surface : 'transparent'};
  border: none;
  border-bottom: ${({ active, theme }) =>
    active ? `4px solid ${theme.colors.primary}` : '4px solid transparent'};
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s, border-bottom 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// Area where the content of active tab is rendered
const TabContent = styled.div`
  padding: 1.5rem 0;
`;

// Tab definition interface
interface Tab {
  label: string;
  content: ReactNode;
}

// Tabs component
export const Tabs: React.FC<{ tabs: Tab[] }> = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TabsContainer>
      <TabList>
        {tabs.map((tab, idx) => (
          <TabButton
            key={tab.label}
            active={idx === activeIndex}
            onClick={() => setActiveIndex(idx)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabList>
      <TabContent>{tabs[activeIndex].content}</TabContent>
    </TabsContainer>
  );
};
