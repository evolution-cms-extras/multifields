<div class="col input-group [+class+]" data-type="richtext" data-name="[+name+]" [+attr+]>
    [+label+]
    <textarea name="tv[+id+]" id="tv[+id+]" class="form-control" rows="4" placeholder="[+placeholder+]" onchange="documentDirty=true;">[+value+]</textarea>
    <div class="input-group-append">
        <button type="button" class="btn btn-secondary" onclick="Multifields.elements.richtext.actionDisplay();">
            <i class="fa fa-edit"></i>
        </button>
    </div>
</div>