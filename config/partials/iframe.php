<?php return [
    'iframe' => [
        'title' => __('multiFields::global.iframe_block'),
        'label' => __('multiFields::global.iframe_block'),
        'icon' => svg('tabler-code')->toHtml(),
        'type' => 'row',
        'actions' => ['move', 'hide', 'expand', 'del'],
        'value' => false,
        'class' => 'col-12',
        'items' => [
            'url' => [
                'title' => __('multiFields::global.iframe_url'),
                'type' => 'text',
                'placeholder' => 'https://...',
                'class' => 'col-12',
            ],
        ],
    ],
];
