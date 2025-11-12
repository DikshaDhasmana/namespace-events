import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date' | 'time' | 'file';

export interface FormField {
  id: string;
  field_type: FieldType;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  options: string[];
  order_index: number;
  is_default?: boolean; // Flag for default fields that cannot be removed
}

interface EventFormBuilderProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
}

const EventFormBuilder = ({ fields, onFieldsChange }: EventFormBuilderProps) => {
  const addField = () => {
    const newField: FormField = {
      id: `temp-${Date.now()}`,
      field_type: 'text',
      label: 'New Field',
      description: '',
      placeholder: '',
      required: false,
      options: [],
      order_index: fields.length,
      is_default: false
    };
    onFieldsChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onFieldsChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    onFieldsChange(fields.filter(f => f.id !== id));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedFields = items.map((field, index) => ({
      ...field,
      order_index: index
    }));

    onFieldsChange(reorderedFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold font-sora">Registration Form Fields</h3>
          <p className="text-sm text-muted-foreground">
            Name and Email are required default fields. Add more fields as needed.
          </p>
        </div>
        <Button onClick={addField} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="p-4"
                    >
                      <div className="flex gap-4">
                        <div {...provided.dragHandleProps} className="flex items-center">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-4">
                          {field.is_default && (
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                              Default Field (Required)
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-inter font-medium">Field Type</Label>
                              <Select
                                value={field.field_type}
                                onValueChange={(value) => updateField(field.id, { field_type: value as FieldType })}
                                disabled={field.is_default}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="textarea">Textarea</SelectItem>
                                  <SelectItem value="radio">Radio</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="time">Time</SelectItem>
                                  <SelectItem value="file">File</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                disabled={field.is_default}
                              />
                              <Label className="font-inter font-medium">Required</Label>
                            </div>
                          </div>
                          <div>
                            <Label className="font-inter font-medium">Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              placeholder="Field label"
                              className="font-inter"
                              disabled={field.is_default}
                            />
                          </div>
                          <div>
                            <Label className="font-inter font-medium">Description</Label>
                            <ReactQuill
                              theme="snow"
                              value={field.description}
                              onChange={(value) => updateField(field.id, { description: value })}
                              placeholder="Optional field description"
                              className="bg-background font-inter"
                            />
                          </div>
                          <div>
                            <Label className="font-inter font-medium">Placeholder</Label>
                            <Input
                              value={field.placeholder}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              placeholder="Field placeholder"
                              className="font-inter"
                            />
                          </div>
                          {['radio', 'checkbox', 'select'].includes(field.field_type) && (
                            <div>
                              <Label className="font-inter font-medium">Options (one per line)</Label>
                              <Textarea
                                value={field.options.join('\n')}
                                onChange={(e) => updateField(field.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                rows={3}
                                className="font-inter"
                              />
                            </div>
                          )}
                        </div>
                        {!field.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteField(field.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {fields.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No fields yet. Click "Add Field" to create your first field.</p>
        </Card>
      )}
    </div>
  );
};

export default EventFormBuilder;
