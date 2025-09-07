"use client";

import React, { useState } from 'react';
import Modal from '../../../src/components/ui/modal/Modal';
import { Select } from '../../../src/components/ui/select/Select';
import Autocomplete from '../../../src/components/ui/autocomplete/Autocomplete';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../src/components/ui/tabs/Tabs';
import { Accordion, AccordionItem } from '../../../src/components/ui/accordion/Accordion';
import Carousel from '../../../src/components/ui/carousel/Carousel';
import Pagination from '../../../src/components/ui/pagination/Pagination';
import Progress from '../../../src/components/ui/progress/Progress';
import LineChart from '../../../src/components/ui/charts/Charts';
import DataTableAdvanced from '../../../src/components/ui/table/DataTableAdvanced';

export default function UIComponentsDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>('apple');
  const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
  ];

  const items = ['Alpha', 'Beta', 'Gamma', 'Delta'];

  const chartLabels = [new Date(2025, 0, 1), new Date(2025, 0, 2), new Date(2025, 0, 3)];
  const chartDatasets = [{ label: 'Visits', data: [10, 20, 15], borderColor: '#3b82f6' }];

  const tableColumns = [
    { key: 'id', header: 'ID', accessor: (r: any) => r.id, sortable: true },
    { key: 'name', header: 'Name', accessor: (r: any) => r.name, sortable: true },
  ];
  const tableData = Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">UI Components Demo</h1>

      <div>
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Open Modal</button>
        <Modal open={open} onOpenChange={setOpen} title="Example Modal">
          <p>This is a demo modal.</p>
        </Modal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium">Select</h3>
          <Select value={selected} onValueChange={setSelected} options={fruits} />
        </div>

        <div>
          <h3 className="font-medium">Autocomplete</h3>
          <Autocomplete items={items} getItemLabel={(s) => s} onSelect={(s) => alert(String(s))} />
        </div>

        <div>
          <h3 className="font-medium">Progress</h3>
          <Progress value={60} showLabel />
        </div>
      </div>

      <div>
        <h3 className="font-medium">Tabs</h3>
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
          <TabsContent value="one">Content one</TabsContent>
          <TabsContent value="two">Content two</TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="font-medium">Accordion</h3>
        <Accordion>
          <AccordionItem value="a" title="First">First content</AccordionItem>
          <AccordionItem value="b" title="Second">Second content</AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="font-medium">Carousel</h3>
        <Carousel visible={1} autoPlay>
          <div className="p-8 bg-gray-100">Slide 1</div>
          <div className="p-8 bg-gray-200">Slide 2</div>
          <div className="p-8 bg-gray-300">Slide 3</div>
        </Carousel>
      </div>

      <div>
        <h3 className="font-medium">Pagination</h3>
        <Pagination total={250} pageSize={10} currentPage={1} onChange={(p) => alert(p)} />
      </div>

      <div>
        <h3 className="font-medium">Chart</h3>
        <div style={{ maxWidth: 600 }}>
          <LineChart labels={chartLabels} datasets={chartDatasets} time />
        </div>
      </div>

      <div>
        <h3 className="font-medium">Data Table (sorting + pagination + filter)</h3>
        <DataTableAdvanced columns={tableColumns as any} data={tableData} pageSize={5} filters={[{ key: 'name', label: 'Name' }]} />
      </div>
    </div>
  );
}
