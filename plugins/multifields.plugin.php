<?php
/**
 * multifields
 *
 * Creating custom fields for documents
 *
 * @category    plugin
 * @version     2.0
 * @package     evo
 * @internal    @properties &multifields_storage=Data storage;list;default,files,database;default &multifields_debug=Plugin debug;list;no,yes;no
 * @internal    @events OnAfterLoadDocumentObject,OnWebPageInit,OnBeforeManagerPageInit,OnManagerMainFrameHeaderHTMLBlock,OnDocFormDelete,OnDocFormSave
 * @internal    @modx_category Manager and Admin
 * @internal    @installset base,sample
 * @author      64j
 */

//@TODO в гетинстанс прокинуть параметры

Event::listen('evolution.OnManagerMainFrameHeaderHTMLBlock', function ($params) {
    if (in_array(evo()->manager->action, [3, 4, 17, 27, 72, 112])) {
        return \Multifields\Base\Core::getInstance()->getStartScripts();
    }
});

Event::listen('evolution.OnManagerMainFrameHeaderHTMLBlock', function ($params) {
    if (isset($_REQUEST['mf-action']) && !empty($_REQUEST['action'])) {
        $className = !empty($_REQUEST['class']) ? $_REQUEST['class'] : '';

        if (class_exists($className)) {
            $class = new $className();
            $method = 'action' . ucfirst(strtolower($_REQUEST['action']));
            if (is_callable([$className, $method])) {
                try {
                    echo $class->$method($_REQUEST);
                } catch (Error $exception) {
                    echo json_encode([
                        'error' => (string)$exception
                    ], JSON_UNESCAPED_UNICODE);
                }
            } else {
                echo 'Method ' . $method . ' not found in class ' . $className . '!';
            }
        } else {
            echo 'Class ' . $className . ' not found!';
        }

        exit;
    }
});

Event::listen('evolution.OnDocFormSave', function ($params) {
    \Multifields\Base\Core::getInstance()->saveData();
});

Event::listen('evolution.OnDocFormDelete', function ($params) {
    \Multifields\Base\Core::getInstance()->deleteData();
});

