@php
    $url = trim((string)($items['url'] ?? ''));
    $embedUrl = '';

    if (filter_var($url, FILTER_VALIDATE_URL)) {
        $parts = parse_url($url);
        $scheme = strtolower((string)($parts['scheme'] ?? ''));
        $host = strtolower((string)($parts['host'] ?? ''));

        if ($scheme === 'https') {
            $embedUrl = $url;

            if (in_array($host, ['docs.google.com', 'drive.google.com'], true)) {
                $path = (string)($parts['path'] ?? '');

                if (preg_match('~/d/(?:e/)?[^/]+/(?:edit|view)/?$~', $path)) {
                    $path = preg_replace('~/(?:edit|view)/?$~', '/preview', $path);
                    $embedUrl = 'https://' . $host . $path;
                }
            }
        }
    }
@endphp

@if($embedUrl !== '')
    <div class="my-10">
        <iframe
            src="{{ $embedUrl }}"
            title="@lang('multiFields::global.iframe_block')"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            style="display:block;width:100%;min-height:75vh;border:0"
        ></iframe>
    </div>
@endif
