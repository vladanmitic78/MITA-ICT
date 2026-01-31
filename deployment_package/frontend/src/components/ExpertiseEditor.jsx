import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ExpertiseEditor = ({ expertise, onChange }) => {
  const [editingAreaIndex, setEditingAreaIndex] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  const addArea = () => {
    const newExpertise = [...(expertise || []), { title: 'New Area', items: [] }];
    onChange(newExpertise);
  };

  const removeArea = (index) => {
    const newExpertise = expertise.filter((_, i) => i !== index);
    onChange(newExpertise);
  };

  const updateAreaTitle = (index, title) => {
    const newExpertise = [...expertise];
    newExpertise[index] = { ...newExpertise[index], title };
    onChange(newExpertise);
  };

  const addItem = (areaIndex) => {
    const newExpertise = [...expertise];
    if (!newExpertise[areaIndex].items) {
      newExpertise[areaIndex].items = [];
    }
    newExpertise[areaIndex].items.push('New Item');
    onChange(newExpertise);
  };

  const updateItem = (areaIndex, itemIndex, value) => {
    const newExpertise = [...expertise];
    newExpertise[areaIndex].items[itemIndex] = value;
    onChange(newExpertise);
  };

  const removeItem = (areaIndex, itemIndex) => {
    const newExpertise = [...expertise];
    newExpertise[areaIndex].items = newExpertise[areaIndex].items.filter((_, i) => i !== itemIndex);
    onChange(newExpertise);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <label className="body-medium">Our Expertise Areas</label>
        <Button
          onClick={addArea}
          style={{
            background: 'var(--brand-hover)',
            color: 'var(--brand-primary)',
            borderRadius: '0px',
            padding: '8px 16px',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Add Area
        </Button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {expertise && expertise.map((area, areaIndex) => (
          <div
            key={areaIndex}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '20px'
            }}
          >
            {/* Area Title */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <Input
                value={area.title}
                onChange={(e) => updateAreaTitle(areaIndex, e.target.value)}
                placeholder="Area Title"
                style={{
                  flex: 1,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  borderRadius: '0px',
                  padding: '10px',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              />
              <button
                onClick={() => removeArea(areaIndex)}
                style={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: 'none',
                  padding: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <Trash2 size={18} color="#ff4444" />
              </button>
            </div>

            {/* Items */}
            <div style={{ marginLeft: '20px' }}>
              {area.items && area.items.map((item, itemIndex) => (
                <div key={itemIndex} style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--brand-primary)', minWidth: '20px' }}>→</span>
                  <Input
                    value={item}
                    onChange={(e) => updateItem(areaIndex, itemIndex, e.target.value)}
                    placeholder="Item"
                    style={{
                      flex: 1,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      borderRadius: '0px',
                      padding: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => removeItem(areaIndex, itemIndex)}
                    style={{
                      background: 'rgba(255, 0, 0, 0.1)',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} color="#ff4444" />
                  </button>
                </div>
              ))}

              <Button
                onClick={() => addItem(areaIndex)}
                style={{
                  background: 'transparent',
                  color: 'var(--brand-primary)',
                  borderRadius: '0px',
                  padding: '6px 12px',
                  fontSize: '14px',
                  border: '1px solid var(--brand-primary)',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                <Plus size={14} />
                Add Item
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpertiseEditor;
