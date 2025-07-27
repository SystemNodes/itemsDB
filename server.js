const itemsDB = require('./localDB.json')
const http = require('http')
const PORT = 9090
const fs = require('fs')
const {v4: uuidv4} = require('uuid')
const { log } = require('console')


//function to validate item data
const validateGood = (data)=>{
    if (!data.name || typeof data.name !== 'string') {
      return 'Name is required and must be a string';
    }
    if (typeof data.inStock !== 'boolean') {
      return 'inStock is required and must be a boolean';
    }
    if (typeof data.unit !== 'number' || data.unit <= 0) {
      return 'Unit is required and must be a number';
    }
    if (typeof data.unitPrice !== 'number' || data.unitPrice < 0) {
      return 'unitPrice is required and must be a non-negative number';
    }
    return null;
  }

  //function to write to Item Database
  const writeItem = (data)=>{
    fs.writeFile('./localDB.json', JSON.stringify(data, null, 1), 'utf-8', ()=>{
      if (error){
        console.log(`Error Creating Item:${error}`);
      }else{
        return data
      }
    })
  }

const server = http.createServer((request, response)=>{
    //Create Items
    if (request.method === 'POST' && request.url === '/create-items'){
        let goods = '';

        request.on('data', (chunks)=>{
            goods += chunks
        });

        request.on('end', ()=>{
           const data = JSON.parse(goods)
           const validationError = validateGood(data);
           if (validationError) {
            response.writeHead(400);
            response.end(JSON.stringify({ error: validationError }));
            return;
          }

            const item = {
                id: uuidv4(),
                name: data.name,
                inStock: data.inStock,
                unit: data.unit,
                unitPrice: data.unitPrice,
                totalPrice: data.unit * data.unitPrice
           };
    
            itemsDB.push(item)
            writeItem(itemsDB)

            response.writeHead(201, {'content-type': 'text/plain'})
            response.end('Item Created Successfully')
        })

    //View all Items
    }else if (request.method === 'GET' && request.url === '/view-items'){
        response.writeHead(200, {'content-type': 'application/json'})
        response.end((JSON.stringify({
            message: 'All items',
            data: itemsDB
        })))

    //Update an Existing Item
    }else if (request.method === 'PUT' && request.url.startsWith('/update-items')){
      const url = request.url
      const id = parseInt(url.split('/')[2]);
      const itemIndex = itemsDB.findIndex((e) => e.id === id);
      
      if (itemIndex === -1){
        response.writeHead(404, {'content-type': 'application/json'})
        response.end(JSON.stringify({
          message: `Item with ID: ${id} not found`
        }))

      }else {
        let goods = '';
        request.on('data', (chunks)=>{
          goods += chunks
        });

        request.on('end', ()=>{
          const data = JSON.parse(goods)
          const validationError = validateGood(data);
            if (validationError) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: validationError }));
              return;
            }
          itemsDB[itemIndex] = {...itemsDB[itemIndex], ...data}
          writeItem(itemsDB)
          response.writeHead(200, {'content-type': 'applicattion/json'})
          response.end(JSON.stringify({
            message: 'Item Updated Successfully',
            data: itemsDB[itemIndex]
          }))
        })
      }

    //Delete an Item  
    }else if (request.method === 'DELETE' && request.url.startsWith('/delete-items')){
      const url = request.url
      const id = parseInt(url.split('/')[2]);
      const itemIndex = itemsDB.findIndex((e) => e.id === id);
      
      if (itemIndex === -1){
        response.writeHead(404, {'content-type': 'application/json'})
        response.end(JSON.stringify({
          message: `Item with ID: ${id} not found`
        }))

      }else {
        let goods = '';
        request.on('data', (chunks)=>{
          goods += chunks
        });

        request.on('end', ()=>{
          const data = JSON.parse(goods)
          const validationError = validateGood(data);
            if (validationError) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: validationError }));
              return;
            }
          itemsDB[itemIndex] = {...itemsDB[itemIndex], ...data}
          writeItem(itemsDB)
          response.writeHead(200, {'content-type': 'applicattion/json'})
          response.end(JSON.stringify({
            message: 'Item deleted Successfully',
            data: itemsDB[itemIndex]
          }))
        })
      }
    }
});

server.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});