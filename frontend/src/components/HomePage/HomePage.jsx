import './HomePage.css';
import Header from '../Header/Header';
import TableDisplay from '../TableDisplay/TableDisplay';
import Modal from '../Modal/Modal';

const HomePage = ({ excelData, solutionId, isExcelUploaded, onExcelUpload, fileName }) => {
    return (
        <div>
            <Header />
            <nav className='nav-list'>
                <button className="nav-link">Existing Session IDs</button>
            </nav>
            <div>
                <div>
                    {!isExcelUploaded ? (
                        <h2 className='font-poppins text-green absolute left-4 top-20 md:absolute p-4 rounded-lg text-sm md:text-lg'>Work Dashboard</h2>
                    ) : (
                        <h2 className='font-poppins text-green absolute left-4 top-20 md:absolute p-4 rounded-lg text-sm md:text-lg'>{fileName}</h2>
                    )}
                    <Modal onExcelUpload={onExcelUpload} />
                    <TableDisplay excelData={excelData} solutionId={solutionId} isExcelUploaded={isExcelUploaded} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;