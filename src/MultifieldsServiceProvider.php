<?php namespace Multifields;

use EvolutionCMS\ServiceProvider;
use Event;

class MultifieldsServiceProvider extends ServiceProvider
{

    protected $namespace = '';

    public function boot()
    {
//        if(IN_MANAGER_MODE) {
//            $this->loadViewsFrom(__DIR__ . '/../views', 'tinymce5settings');
//        }
    }
    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {

        $this->loadPluginsFrom(
            dirname(__DIR__) . '/plugins/'
        );

    }
}