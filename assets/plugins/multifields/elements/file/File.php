<?php

namespace Multifields\Elements\File;

class File extends \Multifields\Base\Elements
{
    protected $styles = 'file.css';
    protected $scripts = 'file.js';

    protected $template = '
        <div class="col [+class+]" data-type="file" data-name="[+name+]" [+attr+]>
            [+label+]
            <input type="text" id="tv[+id+]" class="form-control" name="tv[+id+]" value="[+value+]" placeholder="[+placeholder+]" onchange="documentDirty=true;">
            <i class="[+button.class+]" onclick="BrowseFileServer(\'tv[+id+]\');"></i>
        </div>';

    public function render($params = [], $data = [])
    {
        $params['button.class'] = 'far fa-file';

        if ($params['label'] != '') {
            $params['label'] = '<label for="tv' . $params['id'] . '" ' . $params['label.attr'] . '>' . $params['label'] . '</label>';
        }

        return parent::render($params, $data);
    }
}
