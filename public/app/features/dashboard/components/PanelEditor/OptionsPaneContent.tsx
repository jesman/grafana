import React, { useCallback, useState, useMemo } from 'react';
import { FieldConfigSource, GrafanaTheme, PanelData, PanelPlugin } from '@grafana/data';
import { DashboardModel, PanelModel } from '../../state';
import {
  CustomScrollbar,
  stylesFactory,
  Tab,
  TabContent,
  TabsBar,
  Container,
  useTheme,
  Forms,
  DataLinksInlineEditor,
} from '@grafana/ui';
import { DefaultFieldConfigEditor, OverrideFieldConfigEditor } from './FieldConfigEditor';
import { AngularPanelOptions } from './AngularPanelOptions';
import { css } from 'emotion';
import { OptionsGroup } from './OptionsGroup';
import { getPanelLinksVariableSuggestions } from '../../../panel/panellinks/link_srv';

export const OptionsPaneContent: React.FC<{
  plugin?: PanelPlugin;
  panel: PanelModel;
  data: PanelData;
  dashboard: DashboardModel;
  onFieldConfigsChange: (config: FieldConfigSource) => void;
  onPanelOptionsChanged: (options: any) => void;
  onPanelConfigChange: (configKey: string, value: any) => void;
}> = ({ plugin, panel, data, onFieldConfigsChange, onPanelOptionsChanged, onPanelConfigChange, dashboard }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const linkVariablesSuggestions = useMemo(() => getPanelLinksVariableSuggestions(), []);
  const renderFieldOptions = useCallback(
    (plugin: PanelPlugin) => {
      const fieldOptions = panel.options['fieldOptions'] as FieldConfigSource;

      if (!fieldOptions) {
        return null;
      }

      return (
        <DefaultFieldConfigEditor
          config={fieldOptions}
          plugin={plugin}
          onChange={onFieldConfigsChange}
          data={data.series}
        />
      );
    },
    [data, plugin, panel, onFieldConfigsChange]
  );
  const renderFieldOverrideOptions = useCallback(
    (plugin: PanelPlugin) => {
      const fieldOptions = panel.options['fieldOptions'] as FieldConfigSource;

      if (!fieldOptions) {
        return null;
      }

      return (
        <OverrideFieldConfigEditor
          config={fieldOptions}
          plugin={plugin}
          onChange={onFieldConfigsChange}
          data={data.series}
        />
      );
    },
    [data, plugin, panel, onFieldConfigsChange]
  );

  const renderCustomPanelSettings = useCallback(
    (plugin: PanelPlugin) => {
      if (plugin.editor && panel) {
        return (
          <div style={{ marginTop: '10px' }}>
            <plugin.editor data={data} options={panel.getOptions()} onOptionsChange={onPanelOptionsChanged} />
          </div>
        );
      }

      return <AngularPanelOptions panel={panel} dashboard={dashboard} plugin={plugin} />;
    },
    [data, plugin, panel, onFieldConfigsChange]
  );

  const renderPanelSettings = useCallback(() => {
    console.log(panel.transparent);
    return (
      <div>
        <OptionsGroup title="Basic settings">
          <>
            <Forms.Field label="Panel title">
              <Forms.Input
                defaultValue={panel.title}
                onBlur={e => onPanelConfigChange('title', e.currentTarget.value)}
              />
            </Forms.Field>
            <Forms.Field label="Description" description="Panel description supports markdown and links">
              <Forms.TextArea
                defaultValue={panel.description}
                onBlur={e => onPanelConfigChange('description', e.currentTarget.value)}
              />
            </Forms.Field>
            <Forms.Field label="Transparent" description="Display panel without background">
              <Forms.Switch
                checked={panel.transparent}
                onChange={e => onPanelConfigChange('transparent', e.currentTarget.checked)}
              />
            </Forms.Field>
          </>
        </OptionsGroup>
        <OptionsGroup title="Panel links">
          <DataLinksInlineEditor
            links={panel.links}
            onChange={links => onPanelConfigChange('links', links)}
            suggestions={linkVariablesSuggestions}
            data={data.series}
          />
        </OptionsGroup>
        <OptionsGroup title="Panel repeating">
          <div>TODO</div>
        </OptionsGroup>
      </div>
    );
  }, [data, plugin, panel, onFieldConfigsChange]);

  const [activeTab, setActiveTab] = useState('defaults');

  return (
    <div className={styles.panelOptionsPane}>
      {plugin && (
        <div className={styles.wrapper}>
          <TabsBar
            className={css`
              padding-left: ${theme.spacing.md};
            `}
          >
            <Tab label="Defaults" active={activeTab === 'defaults'} onChangeTab={() => setActiveTab('defaults')} />
            <Tab label="Overrides" active={activeTab === 'overrides'} onChangeTab={() => setActiveTab('overrides')} />
            <Tab label="Custom" active={activeTab === 'custom'} onChangeTab={() => setActiveTab('custom')} />
            <Tab label="General" active={activeTab === 'panel'} onChangeTab={() => setActiveTab('panel')} />
          </TabsBar>
          <TabContent className={styles.tabContent}>
            <CustomScrollbar>
              {activeTab === 'defaults' && renderFieldOptions(plugin)}
              {activeTab === 'overrides' && renderFieldOverrideOptions(plugin)}
              {activeTab === 'custom' && <Container padding="md">{renderCustomPanelSettings(plugin)}</Container>}
              {activeTab === 'panel' && renderPanelSettings()}
            </CustomScrollbar>
          </TabContent>
        </div>
      )}
    </div>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
      height: 100%;
    `,
    panelOptionsPane: css`
      height: 100%;
      width: 100%;
      border-bottom: none;
    `,
    tabContent: css`
      padding: 0;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-height: 0;
      background: ${theme.colors.pageBg};
    `,
  };
});