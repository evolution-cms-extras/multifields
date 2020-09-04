<?php

namespace Multifields\Base;

class Updater
{
    const OLD_VERSION = '1.3.0';

    /**
     * Run updates
     */
    public function run()
    {
        if (version_compare($this->getVersion(), '2.0', '<')) {
            $this->setVersion((new \Multifields\Base\Updates\Updater200())->run());
        }

        if (version_compare($this->getVersion(), Core::VERSION, '<')) {
            $this->setVersion(Core::VERSION);
        }
    }

    /**
     * @return string
     */
    protected function getVersion()
    {
        $evo = evolutionCMS();
        $version = self::OLD_VERSION;

        if (is_file(dirname(__DIR__) . '/version.multifields.php')) {
            $version = file_get_contents(dirname(__DIR__) . '/version.multifields.php');
            unlink(dirname(__DIR__) . '/version.multifields.php');
        } else {
            if ($evo->getConfig('multifields_version')) {
                $version = $evo->getConfig('multifields_version');
            }
        }

        return $version;
    }

    /**
     * @param string $version
     * @return string
     */
    protected function setVersion($version = null)
    {
        $evo = evolutionCMS();

        if (empty($version)) {
            $version = self::OLD_VERSION;
        }

        if ($evo->getConfig('multifields_version')) {
            if (version_compare($evo->getConfig('settings_version'), '2.0', '<')) {
                $evo->db->update([
                    'setting_value' => $evo->db->escape($version)
                ], '[+prefix+]system_settings', 'setting_name = \'multifields_version\'');

                $evo->config['multifields_version'] = $version;
            } else {
                \EvolutionCMS\Models\SystemSetting::query()
                    ->where('setting_name', '=', 'multifields_version')
                    ->update([
                        'setting_value' => $version
                    ]);

                $evo->setConfig('multifields_version', $version);
            }
        } else {
            if (version_compare($evo->getConfig('settings_version'), '2.0', '<')) {
                $evo->db->insert([
                    'setting_name' => 'multifields_version',
                    'setting_value' => $evo->db->escape($version)
                ], '[+prefix+]system_settings');

                $evo->config['multifields_version'] = $version;
            } else {
                \EvolutionCMS\Models\SystemSetting::query()
                    ->insert([
                        'setting_name' => 'multifields_version',
                        'setting_value' => $version
                    ]);

                $evo->setConfig('multifields_version', $version);
            }
        }

        $evo->clearCache('full');

        return $version;
    }
}