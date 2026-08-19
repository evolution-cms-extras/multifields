<?php $config = ['settings' => [], 'templates' => []];
$currentTemplateId = (int)($_REQUEST['template'] ?? $GLOBALS['content']['template'] ?? 0);
$path = __DIR__ . DIRECTORY_SEPARATOR . 'partials' . DIRECTORY_SEPARATOR;
$galleryTemplateIds = [];

if (class_exists(\Seiger\sGallery\sGallery::class)) {
    foreach (config('seiger.settings.sGallery', []) as $galleryTemplate) {
        if (is_array($galleryTemplate)) {
            $galleryTemplateIds[] = (int)array_key_first($galleryTemplate);
        } elseif (is_numeric($galleryTemplate)) {
            $galleryTemplateIds[] = (int)$galleryTemplate;
        }
    }
}

$hasGalleryTab = in_array($currentTemplateId, $galleryTemplateIds, true);

if (in_array($currentTemplateId, [1], true)) {
    if ($hasGalleryTab) {
        $config['templates'] = array_merge(
            include $path . 'hero_slider_sgallery.php',
            $config['templates'],
        );
    }

    if (class_exists(\Seiger\sArticles\sArticles::class)) {
        $config['templates'] = array_merge(
            $config['templates'],
            include $path . 'last_sarticles.php',
        );
    }
}

$config['templates'] = array_merge(
    $config['templates'],
    include $path . 'richtext.php',
    include $path . 'iframe.php',
    include $path . 'cards.php',
    include $path . 'logos.php',
    include $path . 'faq.php',
);

if ($hasGalleryTab) {
    $config['templates'] = array_merge(
        $config['templates'],
        include $path . 'slider_sgallery.php',
    );
}

return $config;
