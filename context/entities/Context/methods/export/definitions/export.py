context = { 'attributes': {}, 'entities': {} }

for entity in self.entities:
    context['entities'][entitye.name] = entity.export()

import json
return json.dumps(context)
